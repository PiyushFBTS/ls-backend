import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getTerminalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // terminal_id

    // 1️⃣ Validate input
    if (!id) {
      return res.status(400).json({ error: "Terminal ID is required" });
    }

    const cacheKey = `terminal:${id}`;

    // 2️⃣ Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`🟢 Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`🟡 Cache miss for ${cacheKey}`);

    // 3️⃣ Query database
    const query = `
      SELECT * FROM posdb.terminal
      WHERE terminal_id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);

    // 4️⃣ If not found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Terminal not found" });
    }

    const terminal = result.rows[0];

    // 5️⃣ Cache the result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(terminal));

    // 6️⃣ Return the response
    return res.status(200).json(terminal);
  } catch (error: any) {
    console.error("❌ Failed to fetch terminal by ID:", error);
    return res.status(500).json({
      message: "Failed to Fetch Terminal",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
