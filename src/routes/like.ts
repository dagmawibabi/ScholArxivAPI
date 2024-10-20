import { Hono } from "hono";
import { db } from "../lib/db";
import addLikeValueToPapers from "../utils/add_dynamic_values_to_papers";
import sessionManager from "../utils/session_manager";

const app = new Hono();

// Introduction
app.get("/", (c) => {
    return c.text("Like Route");
});

// Like a paper
app.post("/paper", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id || "RBT7LHOcFwDAWw9okEiQteR9HWbRteL6";
    let body = await c.req.json();
    let paperID = body["paperID"].toString();

    let newLike = {
        userID: userID,
        paperID: paperID,
        createdAt: new Date().toISOString(),
    };

    // Check if it's been liked before
    let existingLike = await db
        .collection("likes")
        .findOne({ userID: userID, paperID: paperID });

    // Add or remove like
    if (existingLike) {
        // Delete the existing like
        await db
            .collection("likes")
            .deleteOne({ userID: userID, paperID: paperID });
    } else {
        await db.collection("likes").insertOne(newLike);
    }

    // Send back updated paper
    let likedPaper = [await db.collection("papers").findOne({ id: paperID })];
    let updatedPaper = await addLikeValueToPapers(c, likedPaper);

    return c.json(updatedPaper);
});

export default app;
