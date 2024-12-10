import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
// var cors = require("cors");
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

app.use(
    "/api/*",
    cors({
        origin: (origin, c) => {
            // console.log("Origin: ", origin);
            // console.log("Headers: ", c.req.headers);
            const allowedOrigins = [
                "https://www.dagmawi.dev",
                "https://www.scholarxiv.com",
                "https://scholarxiv.com",
            ];
            if (allowedOrigins.indexOf(origin) !== -1) {
                return origin;
            }
            return "https://www.dagmawi.dev";
        },
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
        maxAge: 600,
        credentials: true,
    })
);

app.options("api/*", (c) => {
    return c.text("", 204, {
        "Access-Control-Allow-Origin": "https://www.scholarxiv.com",
        "Access-Control-Allow-Methods":
            "GET, HEAD, PUT, POST, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
            "X-Custom-Header, Upgrade-Insecure-Requests, Content-Type, Authorization",
        "Access-Control-Max-Age": "600",
    });
});

// Intro
app.get("api/", (c) => {
    return c.text("Welcome to ScholArxiv API!");
});

// Routes
app.route("/api/arxiv", arxiv);
app.route("/api/ai", gemini);
app.route("/api/bookmark", bookmark);
app.route("/api/like", like);
app.route("/api/comment", comment);

//Auth
// app.on(["POST", "GET"], "/api/auth/**", async (c) => {
// console.log("Auth Handler");
//     return auth.handler(c.req.raw);
// });

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
