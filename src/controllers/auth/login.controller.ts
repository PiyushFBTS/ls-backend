import { Request, Response } from "express";
import { pool } from "../../db/index";
import bcrypt from "bcryptjs";
import { redis } from "../../db/redis";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    //  Find user in PostgreSQL
    const result = await pool.query("SELECT * FROM posdb.users WHERE user_email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    // Verify password (use bcrypt if you store hashed passwords)
    // const passwordValid = await bcrypt.compare(password, user.user_pass);
    // For plain-text (like your current setup):
    if (password !== user.user_pass) {
      return res.status(401).json({ error: "Invalid password" });
    }

    //  Create payload
    const payload = {
      id: user.user_code,
      email: user.user_email,
      name: user.user_full_name,
      username: user.user_name,
      role: user.role_code,
      companyCode: user.cmp_code,
      companyName: user.cmp_name,
    };

    //  Generate JWT tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    //  Store refresh token in Redis (expire in 7 days)
    await redis.setex(`refreshToken:${user.user_code}`, 7 * 24 * 60 * 60, refreshToken);

    //  Return tokens and user data
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: payload,
    });
  } catch (error: any) {
    console.error(" Login error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
