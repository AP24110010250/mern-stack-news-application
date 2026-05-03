import mongoose from "mongoose";
import slugify from "slugify";

const categories = [
  "World",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Culture",
  "Local"
];

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 140
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
      maxlength: 280
    },
    content: {
      type: String,
      required: [true, "Story content is required"],
      trim: true
    },
    author: {
      type: String,
      default: "Newsroom Desk",
      trim: true
    },
    category: {
      type: String,
      enum: categories,
      default: "World"
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true
    },
    sourceName: {
      type: String,
      default: "Original reporting",
      trim: true
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    readTime: {
      type: Number,
      default: 4,
      min: 1
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

articleSchema.pre("validate", function makeSlug(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

articleSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });
articleSchema.index({ category: 1, publishedAt: -1 });

export { categories };
export default mongoose.model("Article", articleSchema);
