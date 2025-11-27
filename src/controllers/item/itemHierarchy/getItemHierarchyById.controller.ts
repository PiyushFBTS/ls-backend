import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemHierarchyById = async (req: Request, res: Response) => {
  try {
    const { category_code, cmp_code } = req.query;

    // Validate required params
    if (!category_code || !cmp_code) {
      return res.status(400).json({
        error: "Missing required query params: category_code and cmp_code",
      });
    }

    const cacheKey = `item_hierarchy:${cmp_code}:${category_code}`;

    //Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss: ${cacheKey}`);

    // Query DB with composite key
    const query = `
      SELECT * FROM posdb.item_hierarchy 
      WHERE category_code = $1 AND cmp_code = $2
    `;

    const result = await pool.query(query, [category_code, cmp_code]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Item Hierarchy not found for given company" });
    }

    const data = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fetching Item Hierarchy:", error);

    return res.status(500).json({
      message: "Failed to Fetch Item Hierarchy",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
