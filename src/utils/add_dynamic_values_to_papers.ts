import { db } from "../lib/db";
import sessionManager from "./session_manager";

async function addDynamicValuesToPapers(c: any, papers: any[]) {
    let session = await sessionManager(c);
    let userID = session?.user.id;

    let userLikedPapers = await db
        .collection("likes")
        .find({ userID: userID })
        // .project({ paperID: 1 })
        .toArray();
    let paperIDs = [];
    for (var eachLikedPaper of userLikedPapers) {
        paperIDs.push(eachLikedPaper["paperID"]);
    }

    let userBookmarkedPapers = await db
        .collection("bookmarks")
        .find({ userID: userID })
        // .project({ paperID: 1 })
        .toArray();
    let bookmarkedPaperIDs = [];
    for (var eachBookmarkedPaper of userBookmarkedPapers) {
        bookmarkedPaperIDs.push(eachBookmarkedPaper["paperID"]);
    }

    let papersWithLikeCount = [];
    for (var eachPaper of papers) {
        let isLiked = paperIDs.includes(eachPaper["id"]);
        let isBookmarked = bookmarkedPaperIDs.includes(eachPaper["id"]);

        let likeCount = await db
            .collection("likes")
            .countDocuments({ paperID: eachPaper["id"] });
        eachPaper["likes"] = likeCount;
        eachPaper["isLiked"] = isLiked;
        eachPaper["isBookmarked"] = isBookmarked;
        papersWithLikeCount.push(eachPaper);
    }
    papersWithLikeCount.reverse();
    return papersWithLikeCount;
}

export default addDynamicValuesToPapers;
