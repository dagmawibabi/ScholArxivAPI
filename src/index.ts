import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import arxiv from "./routes/arxiv";
import gemini from "./routes/gemini";
import bookmark from "./routes/bookmark";
import like from "./routes/like";
import comment from "./routes/comment";

require("dotenv").config();

// App
const app = new Hono();

// Simple CORS Middleware
app.use(
    "/api/*",
    cors({
        origin: [
            "http://localhost:5173",
            "https://schol-arxiv-web.vercel.app",
            "https://www.ScholArxiv.com",
            "https://saw-5.vercel.app",
        ],
        credentials: true,
    })
);

// Intro
app.get("/", (c) => {
    return c.text("Welcome to ScholArxiv API");
});

// Routes
app.route("/api/arxiv", arxiv);
app.route("/api/gemini", gemini);
app.route("/api/bookmark", bookmark);
app.route("/api/like", like);
app.route("/api/comment", comment);

//Auth
app.on(["POST", "GET"], "/api/auth/**", async (c) => {
    return auth.handler(c.req.raw);
});

// PORT
var port = process.env.PORT ? Number.parseInt(process.env.PORT) : 6400;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

// ERROR HANDLING
app.onError((err, c) => {
    console.error(`${err}`);
    return c.json(err.message);
});
