import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Simple CORS Middleware
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Intro
app.get("/", (c) => {
  return c.text("Welcome to ScholArxiv API");
});

// Routes
import arxiv from "./routes/arxiv";
import { auth } from "./lib/auth";
app.route("/arxiv", arxiv);

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
