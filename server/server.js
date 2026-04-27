import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import articleRoutes from "./routes/articleRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import savedArticleRoutes from "./routes/savedArticleRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.set("etag", false);
app.use(helmet());
app.use(
  cors({
    origin: clientOrigins,
    credentials: true
  })
);
app.use(express.json({ limit: "35mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mern-news-api",
    database: mongoose.connection.readyState === 1 ? "connected" : "sample-data"
  });
});

app.use("/api/articles", articleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/saved-articles", savedArticleRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().finally(() => {
  app.listen(port, () => {
    console.log(`News API listening on port ${port}`);
  });
});
