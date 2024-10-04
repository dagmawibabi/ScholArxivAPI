import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_DB_URI!);
client.connect();
export const db = client.db("my-database");
