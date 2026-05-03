import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Reader"
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"]
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    gender: {
      type: String,
      enum: ["female", "male", "non-binary", "prefer-not-to-say"],
      default: "prefer-not-to-say"
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    resetPasswordTokenHash: String,
    resetPasswordExpiresAt: Date
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    gender: this.gender,
    avatarUrl: this.avatarUrl
  };
};

export default mongoose.model("User", userSchema);
