import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { sampleArticles } from "../data/sampleArticles.js";
import Article, { categories } from "../models/Article.js";
import Category from "../models/Category.js";
import Source from "../models/Source.js";

dotenv.config();

const seed = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.error("Cannot seed without a working MONGO_URI.");
    process.exit(1);
  }

  await Article.deleteMany({});
  await Article.insertMany(sampleArticles);
  console.log(`Seeded ${sampleArticles.length} articles`);

  // Seed Category collection
  await Category.deleteMany({});
  const categoryDocs = categories.map((name) => ({ categoryName: name }));
  await Category.insertMany(categoryDocs);
  console.log(`Seeded ${categoryDocs.length} categories`);

  // Seed Source collection from sample articles
  await Source.deleteMany({});
  const sourceSet = new Map();
  sampleArticles.forEach((article) => {
    if (article.sourceName && !sourceSet.has(article.sourceName)) {
      sourceSet.set(article.sourceName, {
        sourceName: article.sourceName,
        sourceUrl: article.sourceUrl || ""
      });
    }
  });
  if (sourceSet.size) {
    await Source.insertMany([...sourceSet.values()]);
    console.log(`Seeded ${sourceSet.size} sources`);
  }

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
