import { MongoClient } from "mongodb";
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_DB_URI!);
client.connect();
export const db = client.db("ScholArxiv");
