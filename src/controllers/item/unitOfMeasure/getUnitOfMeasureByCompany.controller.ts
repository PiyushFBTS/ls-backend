import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getUnitOfMeasureByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing cmp_code" });
    }

    const cacheKey = `uom:company:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: UOM by Company");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: UOM by Company");

    const query = `
      SELECT * 
      FROM posdb.unit_of_measure
      WHERE cmp_code = $1
      ORDER BY uom_code ASC
    `;

    const result = await pool.query(query, [id]);

    // Save to cache
    await redis.setex(cacheKey, 300, JSON.stringify(result.rows));

    return res.status(200).json(result.rows);

  } catch (error: any) {
    console.error("Failed to fetch Unit of Measure:", error);

    return res.status(500).json({
      message: "Failed to Fetch Unit of Measure",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
