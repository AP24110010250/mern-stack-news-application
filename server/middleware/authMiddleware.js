import User from "../models/User.js";
import { verifyAuthToken } from "../services/tokenService.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Sign in to continue" });
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User account no longer exists" });
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Session expired. Please sign in again" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
