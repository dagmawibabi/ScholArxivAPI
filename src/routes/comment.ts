import { Hono } from "hono";
import { db } from "../lib/db";
import sessionManager from "../utils/session_manager";
import { ObjectId } from "mongodb";

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
        editable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    console.log(newComment);

    await db.collection("comments").insertOne(newComment);
    let commentObj = await db.collection("comments").findOne(newComment);

    // Get all paper comments
    //...

    // Response
    return c.json(commentObj);
});

app.post("/getPaperComments", async (c) => {
    let body = await c.req.json();
    let paperID = body["paperID"].toString();

    // Get root comments
    let comments = await db
        .collection("comments")
        .find({ paperID: paperID, parentID: null })
        .toArray();

    // Response
    return c.json(comments);
});

app.post("/getTrailingComments", async (c) => {
    let body = await c.req.json();
    let commentID = body["commentID"].toString();

    // Get root comments
    let comments = await db
        .collection("comments")
        .find({ parentID: commentID })
        .toArray();

    // Response
    return c.json(comments);
});

app.patch("/editComment", async (c) => {
    let body = await c.req.json();
    let commentID = new ObjectId(body["commentID"].toString());
    let editedComment = body["comment"].toString();

    // Edit comment
    let editedCommentObj = await db.collection("comments").findOneAndUpdate(
        { _id: commentID },
        {
            $set: {
                comment: editedComment,
                updatedAt: new Date().toISOString(),
            },
        },
        { returnDocument: "after" }
    );

    // Response
    return c.json(editedCommentObj);
});

app.post("/deleteComment", async (c) => {
    let body = await c.req.json();
    let commentID = body["commentID"].toString();
    let deletedCommentObj;

    // Check if it has trailing comments
    let result = await db
        .collection("comments")
        .find({ parentID: commentID })
        .toArray();

    if (result.length === 0) {
        // Remove comment completely
        deletedCommentObj = await db
            .collection("comments")
            .findOneAndDelete({ _id: new ObjectId(commentID) });
    } else {
        // Disable comment edit and change content to preserve trailing comments
        deletedCommentObj = await db.collection("comments").findOneAndUpdate(
            { _id: new ObjectId(commentID) },
            {
                $set: {
                    comment: "[DELETED]",
                    updatedAt: new Date().toISOString(),
                    editable: false,
                },
            },
            { returnDocument: "after" }
        );
    }

    // Response
    return c.json(deletedCommentObj);
});

//todo      ADD LIKES AND DYNAMIC VALUE COUNT TO COMMENTS

export default app;
