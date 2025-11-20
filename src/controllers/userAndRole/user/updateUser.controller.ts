import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    const currentUser = req.headers["x-user"] || "system";
    const currentTime = new Date();

    const { user_code, role_code, role_name, user_name, user_full_name, user_mobile, user_email, cmp_code, cmp_name, blocked } = req.body;

    if (!user_code) {
      return res.status(400).json({ error: "user_code is required" });
    }

    const query = `
      UPDATE posdb.users SET
        role_code = $1,
        role_name = $2,
        user_name = $3,
        user_full_name = $4,
        user_mobile = $5,
        user_email = $6,
        cmp_code = $7,
        cmp_name = $8,
        blocked = $9,
        blocked_by = $10,
        blocked_on = $11,
        modified_by = $12,
        modified_on = $13
      WHERE user_code = $14
    `;

    const values = [role_code, role_name, user_name, user_full_name, user_mobile, user_email, cmp_code, cmp_name, blocked, currentUser, currentTime, currentUser, currentTime, user_code];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optional Cache clearing
    try {
      await redis.del("users:all");
      await redis.del(`users:company:${cmp_code}`);
    } catch (err) {
      console.warn(" Failed to clear Redis cache after user update:", err);
    }

    return res.status(200).json({
      message: "User updated successfully",
      status: "success"
    });

  } catch (error: any) {
    console.error(" API Error (User Update):", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
