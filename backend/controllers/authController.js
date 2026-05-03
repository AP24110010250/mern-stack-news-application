import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/mailService.js";
import { createAuthToken } from "../services/tokenService.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role = "user", adminAccessCode, gender } = req.body;
    const normalizedEmail = normalizeEmail(email);
    validateCredentials(normalizedEmail, password);
    validateRole(role, adminAccessCode, gender);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "An account already exists for this email" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name?.trim() || "Reader",
      email: normalizedEmail,
      passwordHash,
      role,
      gender: normalizeGender(gender)
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, adminAccessCode, gender } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    const passwordMatches = user ? await user.comparePassword(password || "") : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "admin") {
      validateAdminAccessCode(adminAccessCode);
    }

    if (gender && normalizeGender(gender) !== user.gender) {
      user.gender = normalizeGender(gender);
      await user.save();
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If that account exists, a reset email has been sent"
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordTokenHash = hashToken(rawToken);
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/reset-password/${rawToken}`;
    const delivery = await sendPasswordResetEmail({
      to: user.email,
      resetUrl
    });

    res.json({
      message: delivery.delivered
        ? "Password reset email sent"
        : "Password reset link created. Configure SMTP to send emails automatically.",
      resetUrl: delivery.delivered ? undefined : resetUrl
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      resetPasswordTokenHash: hashToken(token),
      resetPasswordExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

const buildAuthResponse = (user) => ({
  token: createAuthToken(user),
  user: user.toSafeJSON()
});

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const validateCredentials = (email, password) => {
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    const error = new Error("A valid email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 8) {
    const error = new Error("Password must be at least 8 characters");
    error.statusCode = 400;
    throw error;
  }
};

const validateRole = (role, adminAccessCode, gender) => {
  if (!["user", "admin"].includes(role)) {
    const error = new Error("Invalid account type");
    error.statusCode = 400;
    throw error;
  }

  if (!gender || !allowedGenders.includes(normalizeGender(gender))) {
    const error = new Error("Please choose a gender");
    error.statusCode = 400;
    throw error;
  }

  if (role === "admin") {
    validateAdminAccessCode(adminAccessCode);
  }
};

const validateAdminAccessCode = (adminAccessCode) => {
  if (!process.env.ADMIN_ACCESS_CODE || adminAccessCode !== process.env.ADMIN_ACCESS_CODE) {
    const error = new Error("Invalid admin access code");
    error.statusCode = 403;
    throw error;
  }
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const allowedGenders = ["female", "male", "non-binary", "prefer-not-to-say"];

const normalizeGender = (gender = "") => String(gender).trim().toLowerCase();

export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email, gender, avatarUrl, currentPassword, newPassword } = req.body;

    // Update name
    if (name !== undefined) {
      user.name = name.trim() || "Reader";
    }

    // Update email
    if (email && normalizeEmail(email) !== user.email) {
      const existing = await User.findOne({ email: normalizeEmail(email) });
      if (existing) {
        return res.status(409).json({ message: "This email is already in use" });
      }
      user.email = normalizeEmail(email);
    }

    // Update gender
    if (gender && allowedGenders.includes(normalizeGender(gender))) {
      user.gender = normalizeGender(gender);
    }

    // Update avatar
    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    // Update password (requires current password)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new one" });
      }
      const match = await user.comparePassword(currentPassword);
      if (!match) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();
    res.json({ user: user.toSafeJSON(), message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = req.user;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete your account" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};
