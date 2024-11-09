import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import arxiv from "./routes/arxiv";
import gemini from "./routes/ai";
import bookmark from "./routes/bookmark";
import like from "./routes/like";
import comment from "./routes/comment";
import { csrf } from "hono/csrf";

require("dotenv").config();

// App
const app = new Hono();

// Simple CORS Middleware
app.use(
    "*",
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5173/api",
            "http://localhost:5173/api/auth",
            "https://dagmawi.dev",
            "https://dagmawi.dev/api",
            "https://dagmawi.dev/api/auth",
            "https://saw-5.vercel.app",
            "https://www.ScholArxiv.com",
            "https://ScholArxiv.com",
            "https://schol-arxiv-web.vercel.app",
        ],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    })
);

// app.use(
//     csrf({
//         origin: [
//             "http://localhost:5173",
//             "https://schol-arxiv-web.vercel.app",
//             "https://www.ScholArxiv.com",
//             "https://saw-5.vercel.app",
//         ],
//     })
// );

// Intro
app.get("/", (c) => {
    return c.text("Welcome to ScholArxiv API");
});

// Routes
app.route("/api/arxiv", arxiv);
app.route("/api/ai", gemini);
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
