import { Hono } from "hono";
import { db } from "../lib/db";
import { aiSystemPrompt } from "../lib/constants";
import OpenAI from "openai";

import downloadAndParsePDF from "../utils/download_and_parse_pdf";
require("dotenv").config();

// APP
const app = new Hono();

// Model Init
let openAI: any;

// Intro
app.get("/", async (c) => {
    return c.json("AI Route");
});

// Chat with AI
app.post("/ask", async (c) => {
    let body = await c.req.json();
    let prompt = body["prompt"].toString();
    let papers = body["papers"];
    let aiModel = body["aiModel"].toString().trim() || "gemini-1.5-flash";

    // Get Paper Info
    // let papers = await db
    //     .collection("papers")
    //     .find({ id: { $in: paperIDs } })
    //     .toArray();

    // Convert Objects to String
    let context = JSON.stringify(papers);

    // Ask AI
    let aiResponse;
    if (aiModel == "gemini-1.5-flash") {
        // Gemini
        openAI = new OpenAI({
            apiKey: process.env.GEMINI_API_KEY!,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/",
        });
    } else if (aiModel == "grok-beta") {
        // Grok
        openAI = new OpenAI({
            apiKey: process.env.XAI_API_TOKEN!,
            baseURL: "https://api.x.ai/v1",
        });
    }

    // Result
    const result = await openAI.chat.completions.create({
        model: aiModel,
        messages: [
            { role: "system", content: aiSystemPrompt },
            {
                role: "user",
                content: prompt + [context],
            },
        ],
    });
    aiResponse = result.choices[0].message.content;

    // Response
    return c.json(aiResponse);
});

export default app;
