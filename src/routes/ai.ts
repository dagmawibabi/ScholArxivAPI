import { Hono } from "hono";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../lib/db";
import { aiSystemPrompt } from "../lib/constants";
import downloadAndParsePDF from "../utils/download_and_parse_pdf";
import axios from "axios";
require("dotenv").config();

// APP
const app = new Hono();

// Model Init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const xAIURL = "https://api.x.ai/v1/chat/completions ";

// Intro
app.get("/", async (c) => {
    return c.json("AI Route");
});

// Chat with AI
app.post("/ask", async (c) => {
    let body = await c.req.json();
    let prompt = body["prompt"].toString();
    let paperIDs = body["paperIDs"];
    let aiModel = body["aiModel"] || "gemini-1.5-flash";

    // Get Paper Info
    let papers = await db
        .collection("papers")
        .find({ id: { $in: paperIDs } })
        .toArray();

    // Convert Objects to String
    let context = JSON.stringify(papers);

    // Ask AI
    let aiResponse;
    if (aiModel.toString().trim() == "gemini-1.5-flash") {
        console.log(aiModel);
        // Gemini
        const result = await model.generateContent(
            prompt + aiSystemPrompt + [context]
        );
        aiResponse = result.response.text();
    } else if (aiModel.toString().trim() == "grok-beta") {
        console.log(aiModel);
        // Grok
        const result = await axios.post(
            xAIURL,
            {
                messages: [
                    {
                        role: "system",
                        content: aiSystemPrompt,
                    },
                    {
                        role: "user",
                        content: prompt + [context],
                    },
                ],
                model: "grok-beta",
                stream: false,
                temperature: 0,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.XAI_BEARER_TOKEN}`,
                },
            }
        );

        aiResponse = result.data["choices"][0]["message"]["content"];
    }

    // Response
    return c.json(aiResponse);
});

export default app;
