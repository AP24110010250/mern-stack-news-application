import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Category", categorySchema);
