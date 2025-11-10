import { Request, Response } from "express";
import { verifyRefreshToken, generateAccessToken } from "../../utils/jwt";
import { redis } from "../../db/redis";

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const decoded: any = verifyRefreshToken(refreshToken);

    const storedToken = await redis.get(`refreshToken:${decoded.id}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res.status(403).json({ error: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded);

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    console.error(" Refresh token error:", error);
    return res.status(401).json({
      message: "Invalid or expired refresh token",
      error: error.message,
    });
  }
};
