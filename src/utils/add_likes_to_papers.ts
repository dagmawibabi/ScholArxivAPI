import { auth } from "../lib/auth";
import { db } from "../lib/db";

async function addLikeValueToPapers(c: any, papers: any[]) {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    console.log(session);
    console.log(c.req.raw.headers);

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
