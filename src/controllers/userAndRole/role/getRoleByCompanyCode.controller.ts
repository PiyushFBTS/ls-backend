import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getRolesByCompany = async (req: Request, res: Response) => {
  try {
    const { id: cmp_code } = req.params;

    if (!cmp_code) {
      return res.status(400).json({
        message: "Company code is required",
        status: "fail",
      });
    }

    // Try Redis cache first
    try {
      const cached = await redis.get(`roles:company:${cmp_code}`);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (err) {
      console.warn("Redis fetch error:", err);
    }

    const result = await pool.query(
      "SELECT * FROM posdb.user_roles WHERE cmp_code = $1 ORDER BY role_code",
      [cmp_code]
    );

    // Cache result in Redis
    try {
      await redis.set(`roles:company:${cmp_code}`, JSON.stringify(result.rows));
    } catch (err) {
      console.warn(" Redis cache error:", err);
    }

    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error("Failed to fetch roles by company:", error);

    return res.status(500).json({
      message: "Failed to Fetch Role by Company",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
