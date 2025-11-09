import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getTerminalsByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // company code (cmp_code)

    if (!id) {
      return res.status(400).json({ error: "Company code (cmp_code) is required" });
    }

    const cacheKey = `terminals:company:${id}`;

    // 1️⃣ Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`🟢 Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`🟡 Cache miss for ${cacheKey}`);

    // 2️⃣ Query from PostgreSQL
    const query = `
      SELECT * FROM posdb.terminal 
      WHERE cmp_code = $1 
      ORDER BY store_name ASC
    `;
    const result = await pool.query(query, [id]);

    // 3️⃣ Cache the result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result.rows));

    // 4️⃣ Return the response
    return res.status(200).json(result.rows);
  } catch (error: any) {
    console.error("❌ Failed to fetch Terminals by Company:", error);
    return res.status(500).json({
      message: "Failed to Fetch Terminal",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
