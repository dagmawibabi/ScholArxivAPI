import { Hono } from "hono";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const app = new Hono();

// BaseURL
const baseURL = "http://export.arxiv.org/api/query?search_query=all:";
const defaultStartIndex = "0";
const defaultMaxResults = "50";
const suggestedPaperTitles: any[] = [
    "acid",
    "a theory of justice",
    "attention is all you need",
    "augmented",
    "behavioral",
    "books",
    "black hole",
    "brain",
    "cats",
    "computer",
    "creative",
    "dog",
    "dna sequencing",
    "dyson sphere",
    "ecg",
    "emotional",
    "entanglement",
    "fear",
    "fuzzy sets",
    "fidgeting",
    "glucose",
    "garbage",
    "gonad",
    "hands",
    "heart",
    "higgs boson",
    "hydron",
    "identity",
    "industrial",
    "isolation",
    "laptop",
    "love",
    "laboratory",
    "machine learning",
    "mathematical theory of communication",
    "mental state",
    "micro",
    "microchip",
    "mobile",
    "molecular cloning",
    "neural network",
    "negative",
    "numbers",
    "pc",
    "planet",
    "protein measurement",
    "psychology",
    "quantum",
    "quasar",
    "qubit",
    "reading",
    "relationship",
    "relativity",
    "robotics",
    "rocket",
    "sitting",
    "spider",
    "spiritual",
    "sulphur",
    "television",
    "tiered reward",
    "transport",
    "virtual reality",
    "volcano",
    "vision",
];

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
            "arxiv:doi": eachPaper["arxiv:doi"] || "",
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

    // Response
    return c.json(cleanedPapers);
});

// Recommended Papers
app.get("/recommended", async (c) => {
    // Choose Random Paper Title
    let randomSearchTerm =
        suggestedPaperTitles[
            Math.floor(Math.random() * suggestedPaperTitles.length)
        ];

    // Generate a random number between 0 and 5
    let randomStartIndex = Math.floor(Math.random() * 6).toString();

    // Search and Clean Arxiv Papers
    let cleanedPapers = await searchAndCleanArxivPapers(
        randomSearchTerm,
        randomStartIndex,
        defaultMaxResults
    );

    // Response
    return c.json(cleanedPapers);
});

export default app;
