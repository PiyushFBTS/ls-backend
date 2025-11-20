import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const deleteUsers = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const query = `
      DELETE FROM posdb.users
      WHERE user_code = ANY($1::integer[])
    `;

    await pool.query(query, [ids]);

    try {
      await redis.del("users:all");
    } catch (err) {
      console.warn(" Failed to clear Redis cache after user deletion:", err);
    }

    return res.status(200).json({
      message: "User(s) deleted successfully",
      status: "success",
    });
  } catch (error: any) {
    console.error(" Delete error:", error);
    return res.status(500).json({
      message: "Failed to delete user(s)",
      status: "fail",
      error: error.message,
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
