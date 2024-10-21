import { Hono } from "hono";
import { db } from "../lib/db";
import sessionManager from "../utils/session_manager";

const app = new Hono();

app.get("/", async (c) => {
    return c.text("Comment Route");
});

app.post("/paper", async (c) => {
    let session = await sessionManager(c);
    let userID = session?.user.id || "RBT7LHOcFwDAWw9okEiQteR9HWbRteL6";
    let body = await c.req.json();
    let paperID = body["paperID"].toString();
    let parentID = body["parentID"] || null;
    let comment = body["comment"].toString();

    let newComment = {
        userID: userID,
        paperID: paperID,
        parentID: parentID,
        comment: comment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    console.log(newComment);

    await db.collection("comments").insertOne(newComment);

    // Get all paper comments
    //...

    return c.json("Comment Route");
});

app.post("/getComments", async (c) => {
    let body = await c.req.json();
    let paperID = body["paperID"].toString();
});

export default app;
