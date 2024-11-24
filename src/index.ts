import { serve } from "@hono/node-server";
import { Hono } from "hono";
// import { cors } from "hono/cors";
var cors = require("cors");
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
    "*",
    cors({
        origin: "https://scholarxiv.com",
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus: 200,
        preflightContinue: true,
    })
);

// Simple CORS Middleware
// app.use(
//     "*",
//     cors({
//         origin: [
//             "http://localhost:5173",
//             "http://localhost:5173/api",
//             "http://localhost:5173/api/auth",
//             "https://saw-5.vercel.app",
//             "https://www.scholarxiv.com",
//             "https://scholarxiv.com",
//             "https://dagmawi.dev",
//             "https://dagmawi.dev/api",
//             "https://www.dagmawi.dev",
//             "https://www.dagmawi.dev/api",
//         ],
//         credentials: true,
//         methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//         optionsSuccessStatus: 200,
//         preflightContinue: true,
//     })
// );

// app.use(
//     "*",
//     cors({
//         origin: [
// "https://scholarxiv.com",
// "https://www.scholarxiv.com",
// "https://www.scholarxiv.com/api/sign_in",
// process.env.LOCAL_ORIGIN!,
// process.env.LOCAL_API_ORIGIN!,
// process.env.LOCAL_API_AUTH_ORIGIN!,
// process.env.SAW_ORIGIN!,
// process.env.SCHOLARXIV_ORIGIN!,
// process.env.SCHOLARXIV_ALT_ORIGIN!,
// process.env.DAGMAWI_ORIGIN!,
// process.env.DAGMAWI_API_ORIGIN!,
// process.env.DAGMAWI_DEV_ORIGIN!,
// process.env.DAGMAWI_DEV_API_ORIGIN!,
//         ],
//         allowHeaders: ["Content-Type", "Authorization"],
//         allowMethods: ["POST", "GET", "OPTIONS"],
//         exposeHeaders: ["Content-Length"],
//         maxAge: 600,
//         credentials: true,
//     })
// );

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
