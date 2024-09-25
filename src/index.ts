import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Simple CORS Middleware
app.use(
    "/*",
    cors({
        origin: "*",
    })
);

// Intro
app.get("/", (c) => {
    return c.text("Welcome to ScholArxiv API");
});

// Routes
import arxiv from "./routes/arxiv";

app.route("/arxiv", arxiv);

const port = 5400;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
