import { db } from "../lib/db";
import sessionManager from "./session_manager";

async function addDynamicValuesToPapers(c: any, papers: any[]) {
    let session = await sessionManager(c);
    let userID = session?.user.id;

    // IsLiked
    let userLikedPapers = await db
        .collection("likes")
        .find({ userID: userID })
        // .project({ paperID: 1 })
        .toArray();
    let paperIDs = [];
    for (var eachLikedPaper of userLikedPapers) {
        paperIDs.push(eachLikedPaper["paperID"]);
    }

    // IsBookmarked
    let userBookmarkedPapers = await db
        .collection("bookmarks")
        .find({ userID: userID })
        // .project({ paperID: 1 })
        .toArray();
    let bookmarkedPaperIDs = [];
    for (var eachBookmarkedPaper of userBookmarkedPapers) {
        bookmarkedPaperIDs.push(eachBookmarkedPaper["paperID"]);
    }

    // IsLiked and IsBookmarked
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

    // Add comment count
    for (var eachPaper of papers) {
        let commentCount = await db.collection("comments").countDocuments({
            extractedID: eachPaper["extractedID"],
            parentID: null,
        });
        eachPaper.commentCount = commentCount;
        papersWithLikeCount.push(eachPaper);
    }

    papersWithLikeCount.reverse();
    return papersWithLikeCount;
}

export default addDynamicValuesToPapers;
