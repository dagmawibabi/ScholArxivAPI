import { db } from "../lib/db";
import sessionManager from "./session_manager";

async function addLikeValueToPapers(c: any, papers: any[]) {
    let session = await sessionManager(c);
    let userID = session?.user.id;

    let papersWithLike = [];
    for (var eachPaper of papers) {
        let likeCount = await db
            .collection("likes")
            .countDocuments({ paperID: eachPaper["id"] });
        eachPaper["likes"] = likeCount;
        papersWithLike.push(eachPaper);
    }
    return papersWithLike;
}

export default addLikeValueToPapers;
