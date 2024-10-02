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

// PORT
var port = Number.parseInt(process.env.PORT!) || 6400;
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
