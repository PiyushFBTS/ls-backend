import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getUsersByCompany = async (req: Request, res: Response) => {
  try {
    const { id: cmp_code } = req.params;

    if (!cmp_code) {
      return res.status(400).json({ error: "Company code is required" });
    }

    try {
      const cached = await redis.get(`users:company:${cmp_code}`);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn(" Redis fetch error:", cacheErr);
    }

    const result = await pool.query(
      "SELECT * FROM posdb.users WHERE cmp_code = $1",
      [cmp_code]
    );

    try {
      await redis.set(`users:company:${cmp_code}`, JSON.stringify(result.rows));
    } catch (cacheErr) {
      console.warn(" Redis cache error:", cacheErr);
    }

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error(" Error fetching users by company:", error);
    return res.status(500).json({
      message: "Failed to Fetch Users",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
