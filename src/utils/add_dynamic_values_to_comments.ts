import { ObjectId } from "mongodb";
import { db } from "../lib/db";
import sessionManager from "./session_manager";

async function addDynamicValuesToComments(c: any, comments: any[]) {
    let session = await sessionManager(c);
    let userID = session?.user.id || "RBT7LHOcFwDAWw9okEiQteR9HWbRteL6";
    let commentsWithName = [];

    // Add the name of the commenter
    for (let eachComment of comments) {
        let commenter = await db
            .collection("user")
            .findOne({ id: eachComment.userID });
        eachComment.commenter = commenter;
        commentsWithName.push(eachComment);
    }

    // Add number of trailing comments
    for (let eachComment of comments) {
        let trailingCommentCount = await db
            .collection("comments")
            .countDocuments({ parentID: eachComment["_id"].toString() });
        console.log(trailingCommentCount);
        eachComment.trailingCommentCount = trailingCommentCount;
    }

    // Add number of likes
    for (let eachComment of comments) {
        let likeCount = await db
            .collection("commentlikes")
            .countDocuments({ commentID: eachComment["_id"].toString() });
        eachComment.likeCount = likeCount;
    }

    // Is Liked
    for (let eachComment of comments) {
        let likedComments = await db.collection("commentlikes").findOne({
            userID: userID,
            commentID: eachComment["_id"].toString(),
        });
        if (likedComments) {
            eachComment.isLiked = true;
        } else {
            eachComment.isLiked = false;
        }
    }

    return commentsWithName;
}

export default addDynamicValuesToComments;
