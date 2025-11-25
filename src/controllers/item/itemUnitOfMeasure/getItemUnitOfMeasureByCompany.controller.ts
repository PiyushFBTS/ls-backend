import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemUnitOfMeasureByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing company code" });
    }

    const cacheKey = `item_UnitOfMeasure :company:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: item_UnitOfMeasure _by_company");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: item_UnitOfMeasure _by_company");

    const result = await pool.query(
      `
        SELECT * 
        FROM posdb.item_unit_of_measure 
        WHERE cmp_code = $1 
        ORDER BY item_unit_of_measure_code ASC
      `,
      [id]
    );

    const data = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Failed to fetch item unit of measure:", error);

    return res.status(500).json({
      message: "Failed to Fetch item Unit of Measure",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
