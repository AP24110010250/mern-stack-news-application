import mongoose from "mongoose";

const savedArticleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    slug: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    excerpt: String,
    content: String,
    author: String,
    category: String,
    imageUrl: String,
    sourceName: String,
    sourceUrl: String,
    tags: {
      type: [String],
      default: []
    },
    readTime: Number,
    publishedAt: Date
  },
  {
    timestamps: true
  }
);

savedArticleSchema.index({ user: 1, slug: 1 }, { unique: true });

export default mongoose.model("SavedArticle", savedArticleSchema);
