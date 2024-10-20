import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { db } from "../lib/db";

import {
    baseURL,
    pdfBaseURL,
    defaultSearchFilter,
    defaultSortBy,
    defaultSortOrder,
} from "../lib/constants";
import { searchStringOBJI } from "../types/types";

// Function to search Arxiv API
async function arxivAPICall(
    startIndex: string,
    maxResults: string,
    searchFilterString = defaultSearchFilter,
    sortBy = defaultSortBy,
    sortOrder = defaultSortOrder
) {
    let responseXML = await axios.get(
        `${baseURL}${searchFilterString}&start=${startIndex}&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    );
    return responseXML.data;
}

// Function to parse XLM to JS object
function parseXMLToJS(data: string) {
    let parser = new XMLParser();
    let jsObj = parser.parse(data);
    return jsObj;
}

// Function to Identify PDF link
function parsePDFLinkFromPaperID(paperID: string) {
    const extractedID = paperID.split("/").pop();
    let pdfURL = "";
    if (extractedID && extractedID.includes(".")) {
        pdfURL = `${pdfBaseURL}/${extractedID}`;
    } else {
        pdfURL = `${pdfBaseURL}/cond-mat/${extractedID}`;
    }
    return pdfURL;
}

// Function to remove /n from texts
function removeNewLineCharacter(text: string) {
    const cleanedText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    return cleanedText;
}

// Funtion to clear the response
async function cleanPapers(rawPapers: any) {
    let cleanedPapers = [];
    for (var eachPaper of rawPapers) {
        let curPaper = {
            id: eachPaper["id"],
            extractedID: eachPaper["id"].split("/").pop(),
            updated: eachPaper["updated"],
            published: eachPaper["published"],
            title: eachPaper["title"],
            summary: eachPaper["summary"],
            authors: eachPaper["author"],
            doi: eachPaper["arxiv:doi"] || "",
            journalRef: eachPaper["arxiv:journal_ref"] || "",
            primaryCategory: eachPaper["arxiv:primary_category"] || "",
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

// Add to DB
async function addPapersToDB(cleanedPapers: any[]) {
    // Retrieve all existing papers from the database once
    const existingPapers = await db.collection("papers").find({}).toArray();
    const existingIDs = new Set(existingPapers.map((paper) => paper.id));

    // Collect new papers to insert
    const papersToInsert = [];
    for (const paper of cleanedPapers) {
        if (!existingIDs.has(paper.id)) {
            papersToInsert.push(paper);
        }
    }

    // Insert all new papers at once
    if (papersToInsert.length > 0) {
        await db.collection("papers").insertMany(papersToInsert);
    }
}

// Create the filtering search string connected with AND
function createSearchString(searchFilter: searchStringOBJI) {
    // Check if the 'all' key has a value, return it if so
    if (searchFilter.all) {
        return `all:${searchFilter.all}`;
    }

    let searchParams = [];

    // Iterate over other keys only if 'all' is not present or empty
    for (let key in searchFilter) {
        if (key !== "all" && searchFilter[key as keyof typeof searchFilter]) {
            // Skip 'all' key
            searchParams.push(
                `${key}:${searchFilter[key as keyof typeof searchFilter]}`
            );
        }
    }

    return searchParams.join("+AND+");
}

// Function to search arxiv
async function paperSearch(
    startIndex: string,
    maxResults: string,
    searchFilterObj: searchStringOBJI,
    sortBy = defaultSortBy,
    sortOrder = defaultSortOrder
) {
    // Create advanced search
    let searchFilterString = createSearchString(searchFilterObj);

    // Arxiv Response
    let responseXML = await arxivAPICall(
        startIndex,
        maxResults,
        searchFilterString,
        sortBy,
        sortOrder
    );

    let cleanedPapers: any[] = [];
    try {
        cleanedPapers = await parseCleanAndAddPapersToDB(responseXML);
    } catch (e) {}

    // Response
    return cleanedPapers;
}

async function parseCleanAndAddPapersToDB(responseXML: any) {
    // Parse XML
    let jsObj = parseXMLToJS(responseXML);

    // Custom Object
    let rawPapers = jsObj["feed"]["entry"] || [];
    let cleanedPapers = await cleanPapers(rawPapers);

    // Add papers to DB
    //! MAY NOT BE NECESSARY TO AWAIT
    await addPapersToDB(cleanedPapers);

    // Response
    return cleanedPapers;
}

export default paperSearch;
