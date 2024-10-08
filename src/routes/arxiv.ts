import { Hono } from "hono";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import {
    baseURL,
    pdfBaseURL,
    defaultStartIndex,
    defaultMaxResults,
    suggestedPaperTitles,
} from "../lib/constants";
import { db } from "../lib/db";
import addLikeValueToPapers from "../utils/add_likes_to_papers";

const app = new Hono();

// Function to search Arxiv API
async function arxivAPICall(
    searchTerm: string,
    startIndex: string,
    maxResults: string
) {
    let responseXML = await axios.get(
        `${baseURL}${searchTerm}&start=${startIndex}&max_results=${maxResults}`
    );
    return responseXML.data;
}

// Function to Identify PDF link
function parsePDFLinkFromPaperID(paperID: string) {
    const extractedId = paperID.split("/").pop();
    let pdfURL = "";
    if (extractedId && extractedId.includes(".")) {
        pdfURL = `${pdfBaseURL}/${extractedId}`;
    } else {
        pdfURL = `${pdfBaseURL}/cond-mat/${extractedId}`;
    }
    return pdfURL;
}

// Funtion to clear the response
async function cleanPapers(rawPapers: any) {
    let cleanedPapers = [];
    for (var eachPaper of rawPapers) {
        let curPaper = {
            id: eachPaper["id"],
            updated: eachPaper["updated"],
            published: eachPaper["published"],
            title: eachPaper["title"],
            summary: eachPaper["summary"],
            authors: eachPaper["author"],
            doi: eachPaper["arxiv:doi"] || "",
            journal_ref: eachPaper["arxiv:journal_ref"] || "",
            primary_category: eachPaper["arxiv:primary_category"] || "",
            category: eachPaper["arxiv:category"] || "",
            comment: eachPaper["arxiv:comment"] || "",

            pdfLink: parsePDFLinkFromPaperID(eachPaper["id"]),
        };

        // Clean Title
        const cleanedTitle = removeNewLineCharacter(curPaper["title"]);

        // Clean Summary
        const cleanedSummary = removeNewLineCharacter(curPaper["summary"]);

        // Format Authors
        let authorList = [];
        try {
            for (var eachAuthor of curPaper["authors"]) {
                authorList.push(eachAuthor["name"]);
            }
        } catch (e) {
            authorList.push(eachPaper["author"]["name"]);
        }

        // Add to response
        curPaper["title"] = cleanedTitle;
        curPaper["summary"] = cleanedSummary;
        curPaper["authors"] = authorList;
        cleanedPapers.push(curPaper);
    }
    return cleanedPapers;
}

// Function to parse XLM to JS object
function parseXMLToJS(data: string) {
    let parser = new XMLParser();
    let jsObj = parser.parse(data);
    return jsObj;
}

// Function to remove /n from texts
function removeNewLineCharacter(text: string) {
    const cleanedText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    return cleanedText;
}

// Function to search arxiv
async function searchAndCleanArxivPapers(
    searchTerm: string,
    startIndex: string,
    maxResults: string
) {
    // Arxiv Response
    let responseXML = await arxivAPICall(searchTerm, startIndex, maxResults);

    // Parse XML
    let jsObj = parseXMLToJS(responseXML);

    // Custom Object
    let rawPapers = jsObj["feed"]["entry"] || [];
    let cleanedPapers = await cleanPapers(rawPapers);

    return cleanedPapers;
}

// Add to DB
async function addPapersToDB(cleanedPapers: any[]) {
    // Retrieve all existing papers from the database once
    const existingPapers = await db.collection("papers").find({}).toArray();
    const existingIds = new Set(existingPapers.map((paper) => paper.id));

    // Collect new papers to insert
    const papersToInsert = [];
    for (const paper of cleanedPapers) {
        if (!existingIds.has(paper.id)) {
            papersToInsert.push(paper);
        }
    }

    // Insert all new papers at once
    if (papersToInsert.length > 0) {
        await db.collection("papers").insertMany(papersToInsert);
    }
}

// Search Papers
app.get("/search", async (c) => {
    // Parse Parameters
    let searchTerm = c.req.query("searchTerm") || "";
    let startIndex = c.req.query("startIndex") || defaultStartIndex;
    let maxResults = c.req.query("maxResults") || defaultMaxResults;

    // Search and Clean Arxiv Papers
    let cleanedPapers = await searchAndCleanArxivPapers(
        searchTerm,
        startIndex,
        maxResults
    );

    // Add papers to DB
    await addPapersToDB(cleanedPapers);
    let papersWithLikes = await addLikeValueToPapers(c, cleanedPapers);

    // let localSearch = await db
    //     .collection("papers")
    //     .find({ title: { $regex: `^${searchTerm}`, $options: "i" } })
    //     .toArray();
    // let papersWithLikes = await addLikeValueToPapers(c, localSearch);

    // Response
    return c.json(papersWithLikes);
});

// Discover Papers
app.get("/discover", async (c) => {
    let discoveredPapers = await db
        .collection("papers")
        .aggregate([{ $sample: { size: parseInt(defaultMaxResults) } }])
        .toArray();
    let papersWithLikes = await addLikeValueToPapers(c, discoveredPapers);

    // // Choose Random Paper Title
    // let randomSearchTerm = suggestedPaperTitles[0];

    // // Generate a random number between 0 and 5
    // let randomStartIndex = "0"; //Math.floor(Math.random() * 6).toString();

    // // Search and Clean Arxiv Papers
    // let cleanedPapers = await searchAndCleanArxivPapers(
    //     randomSearchTerm,
    //     randomStartIndex,
    //     defaultMaxResults
    // );

    // await addPapersToDB(cleanedPapers);
    // let papersWithLikes = await addLikeValueToPapers(c, cleanedPapers);

    // Response
    return c.json(papersWithLikes);
});

export default app;
