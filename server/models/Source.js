import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      required: [true, "Source name is required"],
      unique: true,
      trim: true
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Source", sourceSchema);
