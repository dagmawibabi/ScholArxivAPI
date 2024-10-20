import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../lib/db";
import { aiSystemPrompt } from "../lib/constants";
import downloadAndParsePDF from "../utils/download_and_parse_pdf";
require("dotenv").config();

// APP
const app = new Hono();

// Model Init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/", async (c) => {
    return c.json("Gemini Route");
});

// Chat with AI
app.post("/ask", async (c) => {
    let body = await c.req.json();
    let prompt = body["prompt"].toString();
    let paperIDs = body["paperIDs"];

    // Get Paper Info
    let papers = await db
        .collection("papers")
        .find({ id: { $in: paperIDs } })
        .toArray();

    // Convert Objects to String
    let context = JSON.stringify(papers);

    // Ask AI
    const result = await model.generateContent(
        prompt + aiSystemPrompt + [context]
    );

    // Response
    return c.json(result.response.text());
});

export default app;
