import { Hono } from "hono";
import {
    defaultStartIndex,
    defaultMaxResults,
    defaultSearchFilter,
    suggestedPaperTitles,
    defaultSortBy,
    defaultSortOrder,
} from "../lib/constants";
import addDynamicValuesToPapers from "../utils/add_dynamic_values_to_papers";
import { db } from "../lib/db";
import paperSearch from "../utils/arxiv_functions";
import { searchStringOBJI } from "../types/types";

const app = new Hono();

// Introduction
app.get("/", (c) => {
    return c.text("Search and Discover Route");
});

// Search Papers
app.post("/search", async (c) => {
    let body = await c.req.json();

    // Parse Parameters
    let startIndex = body["startIndex"] || defaultStartIndex;
    let maxResults = body["maxResults"] || defaultMaxResults;
    let searchFilterOBJ = body["searchFilter"] || defaultSearchFilter;
    let sortBy = body["sortBy"] || defaultSortBy;
    let sortOrder = body["sortOrder"] || defaultSortOrder;

    // Search and Clean Arxiv Papers
    let cleanedPapers = await paperSearch(
        startIndex,
        maxResults,
        searchFilterOBJ,
        sortBy,
        sortOrder
    );

    // Add comment and like values
    let papersWithLikes = await addDynamicValuesToPapers(c, cleanedPapers);

    // let localSearch = await db
    //     .collection("papers")
    //     .find({ title: { $regex: `^${searchTerm}`, $options: "i" } })
    //     .toArray();
    // let papersWithLikes = await addDynamicValuesToPapers(c, localSearch);

    // Response
    return c.json(papersWithLikes);
});

// Discover Papers
app.get("/discoverArxiv", async (c) => {
    // Choose Random Paper Title
    let randomSearchTerm = suggestedPaperTitles[0];

    // Generate a random number between 0 and 5
    let randomStartIndex = Math.floor(Math.random() * 6).toString();

    let searchFilterOBJ: searchStringOBJI = {
        all: randomSearchTerm,
    };

    // Search and Clean Arxiv Papers
    let cleanedPapers = await paperSearch(
        randomStartIndex,
        defaultMaxResults,
        searchFilterOBJ
    );

    // Add comment and like values
    let papersWithLikes = await addDynamicValuesToPapers(c, cleanedPapers);

    // Response
    return c.json(papersWithLikes);
});

// Discover Papers from DB
//! This's very slow because it makes two calls to the DB
//! and the skip function takes time skipping over papers
app.get("/discoverLocal", async (c) => {
    // Get total number of documents and pick a random starting point
    let totalDocs = await db.collection("papers").countDocuments();
    let randomSkip = Math.floor(Math.random() * totalDocs);

    let discoveredPapers = await db
        .collection("papers")
        .find({})
        .sort({ createdAt: -1 })
        .skip(randomSkip)
        .limit(parseInt(defaultMaxResults))
        .toArray();

    // Add comment and like values
    let papersWithLikes = await addDynamicValuesToPapers(c, discoveredPapers);

    // Response
    return c.json(papersWithLikes);
});

// Discover Mixed Topic
app.get("/discoverLocalMixedTopics", async (c) => {
    let discoveredPapers = await db
        .collection("papers")
        .aggregate([{ $sample: { size: parseInt(defaultMaxResults) } }])
        .toArray();

    // Add comment and like values
    let papersWithLikes = await addDynamicValuesToPapers(c, discoveredPapers);

    // Response
    return c.json(papersWithLikes);
});

export default app;
