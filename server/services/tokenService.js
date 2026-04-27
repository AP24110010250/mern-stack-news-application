import jwt from "jsonwebtoken";

export const createAuthToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    getJwtSecret(),
    {
      expiresIn: "7d"
    }
  );

export const verifyAuthToken = (token) => jwt.verify(token, getJwtSecret());

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};
