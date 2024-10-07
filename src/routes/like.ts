import { Hono } from "hono";
import { db } from "../lib/db";
import addLikeValueToPapers from "../utils/add_likes_to_papers";
import sessionManager from "../utils/session_manager";

const app = new Hono();

// app.get("/", async (c) => {
//     let papers = await db.collection("papers").find().limit(5).toArray();
//     let result = await addLikeValueToPapers(papers);
//     return c.json(result);
// });

// Like a paper
app.post("/paper", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id;
    let body = await c.req.json();
    let paperID = body["paperID"].toString();

    let newLike = {
        userID: userID,
        paperID: paperID,
        createdAt: new Date().toISOString(),
    };

    // Add new like
    let existingLike = await db
        .collection("likes")
        .findOne({ userID: userID, paperID: paperID });
    if (existingLike) {
        // Delete the existing like
        await db
            .collection("likes")
            .deleteOne({ userID: userID, paperID: paperID });
    } else {
        await db.collection("likes").insertOne(newLike);
    }

    // Send back all likes
    // let papers = await addLikeValueToPapers(c, newLike);

    return c.json({});
});

export default app;
