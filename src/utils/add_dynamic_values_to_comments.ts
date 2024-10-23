import { db } from "../lib/db";

async function addDynamicValuesToComments(c: any, comments: any[]) {
    let commentsWithName = [];
    for (let eachComment of comments) {
        let commenter = await db
            .collection("user")
            .findOne({ id: eachComment.userID });
        eachComment.commenter = commenter;
        commentsWithName.push(eachComment);
    }
    return commentsWithName;
}

export default addDynamicValuesToComments;
