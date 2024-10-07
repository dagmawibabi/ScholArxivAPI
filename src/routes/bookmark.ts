import { Hono } from "hono";
import { db } from "../lib/db";
import sessionManager from "../utils/session_manager";
import addLikeValueToPapers from "../utils/add_likes_to_papers";

const app = new Hono();

async function getBookmarkedPapers(userID: string) {
    // Get User Bookmarks
    let result = await db
        .collection("bookmarks")
        .find({ userID: userID })
        .toArray();

    // Extract paperIDs from the bookmarks
    let paperIDs = result.map((bookmark) => bookmark.paperID);

    // Fetch papers using the extracted paperIDs
    let papers = await db
        .collection("papers")
        .find({ id: { $in: paperIDs } })
        .toArray();

    return papers;
}

app.get("/", (c) => {
    return c.text("Bookmark Route");
});

app.get("/myBookmarks", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id;

    // Get all bookmarks
    let rawBookmarks = await getBookmarkedPapers(userID);
    let bookmarkedPapers = await addLikeValueToPapers(c, rawBookmarks);

    return c.json(bookmarkedPapers);
});

app.post("/paper", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id;
    let body = await c.req.json();
    let paperID = body["paperID"].toString();

    console.log(userID);

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
    let papers = await getBookmarkedPapers(userID);

    return c.json(papers);
});

export default app;
