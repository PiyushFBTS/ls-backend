import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getTerminalById = async (req: Request, res: Response) => {
  try {
    const { terminal_id, cmp_code } = req.query;

    // Validate required query params
    if (!terminal_id || !cmp_code) {
      return res.status(400).json({
        error: "Missing required query parameters: terminal_id, cmp_code",
      });
    }

    const cacheKey = `terminal:${cmp_code}:${terminal_id}`;

    // Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {;
      return res.status(200).json(JSON.parse(cached));
    }

    // DB query with composite key
    const query = `
      SELECT *
      FROM posdb.terminal
      WHERE terminal_id = $1
        AND cmp_code = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [terminal_id, cmp_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Terminal not found" });
    }

    const terminal = result.rows[0];

    // Cache result (5-minute TTL)
    await redis.setex(cacheKey, 300, JSON.stringify(terminal));

    return res.status(200).json(terminal);

  } catch (error: any) {
    console.error(" Failed to fetch terminal by ID:", error);
    return res.status(500).json({
      message: "Failed to Fetch Terminal",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
