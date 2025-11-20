import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    try {
      const cached = await redis.get("users:all");
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn(" Failed to fetch users from Redis:", cacheErr);
    }

    const result = await pool.query(
      "SELECT * FROM posdb.users ORDER BY cmp_name ASC"
    );

    try {
      await redis.set("users:all", JSON.stringify(result.rows));
    } catch (cacheErr) {
      console.warn(" Failed to cache users:", cacheErr);
    }

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error(" Error fetching users:", error);
    return res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
