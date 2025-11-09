import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      companyCode: user.companyCode,
      companyName: user.companyName,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // 15 minutes
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
