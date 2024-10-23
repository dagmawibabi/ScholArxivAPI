import { Hono } from "hono";
import { db } from "../lib/db";
import sessionManager from "../utils/session_manager";
import { ObjectId } from "mongodb";
import addDynamicValuesToPapers from "../utils/add_dynamic_values_to_papers";
import addDynamicValuesToComments from "../utils/add_dynamic_values_to_comments";

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
        extractedID: paperID.split("/").pop(),
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
    let extractedID = body["extractedID"].toString();

    // Get Paper
    let paper = await db
        .collection("papers")
        .findOne({ extractedID: extractedID, parentID: null });

    // Add comment and like values
    let papersWithLikes = await addDynamicValuesToPapers(c, [paper]);

    // Get root comments
    let comments = await db
        .collection("comments")
        .find({ extractedID: extractedID, parentID: null })
        .toArray();

    // Add who commented to comments
    let commentsWithName = await addDynamicValuesToComments(c, comments);

    let responseOBJ = {
        paper: papersWithLikes[0],
        comments: commentsWithName,
    };

    // Response
    return c.json(responseOBJ);
});

app.post("/getTrailingComments", async (c) => {
    let body = await c.req.json();
    let commentID = body["commentID"].toString();

    // Get root comments
    let comments = await db
        .collection("comments")
        .find({ parentID: commentID })
        .toArray();

    // Add who commented to comments
    let commentsWithName = await addDynamicValuesToComments(c, comments);

    // Response
    return c.json(commentsWithName);
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
