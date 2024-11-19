import { Hono } from "hono";
import { db } from "../lib/db";
import sessionManager from "../utils/session_manager";
import addDynamicValuesToPapers from "../utils/add_dynamic_values_to_papers";

const app = new Hono();

async function getBookmarkedPapers(c: any, userID: string) {
    // Get User Bookmarks
    let result = await db
        .collection("bookmarks")
        .find({ userID: userID })
        .toArray();

    // Extract paperIDs from the bookmarks
    let paperIDs = result.map((bookmark) => bookmark.paperID);

    // Fetch papers using the extracted paperIDs
    let rawBookmarks = await db
        .collection("papers")
        .find({ id: { $in: paperIDs } })
        .toArray();

    // Add dynamic values
    let bookmarkedPapers = await addDynamicValuesToPapers(c, rawBookmarks);

    return bookmarkedPapers;
}

// Introduction
app.get("/", (c) => {
    return c.text("Bookmark Route");
});

app.get("/myBookmarks", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id;

    // Get all bookmarks
    let bookmarkedPapers = await getBookmarkedPapers(c, userID);

    // Response
    return c.json(bookmarkedPapers);
});

app.post("/paper", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id;
    let body = await c.req.json();
    let paperID = body["paperID"].toString();

    // New bookmark obj
    let newBookmark = {
        userID: userID,
        paperID: paperID,
        createdAt: new Date().toISOString(),
    };

    // Add new bookmark
    let existingBookmark = await db
        .collection("bookmarks")
        .findOne({ userID: userID, paperID: paperID });
    if (existingBookmark) {
        // Delete the existing bookmark
        await db
            .collection("bookmarks")
            .deleteOne({ userID: userID, paperID: paperID });
    } else {
        await db.collection("bookmarks").insertOne(newBookmark);
    }

    // Send back all bookmarks
    let bookmarkedPapers = await getBookmarkedPapers(c, userID);

    // Response
    return c.json(bookmarkedPapers);
});

export default app;
