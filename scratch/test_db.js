import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "server", ".env") });

async function checkConnection() {
  console.log("Attempting to connect to:", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("SUCCESS: MongoDB connected");
    process.exit(0);
  } catch (error) {
    console.error("FAILURE: MongoDB connection failed");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    process.exit(1);
  }
}

checkConnection();
