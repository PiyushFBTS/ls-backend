import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemUnitOfMeasureById = async (req: Request, res: Response) => {
  try {
    const { cmp_code, item_unit_of_measure_code } = req.query;

    if (!cmp_code || !item_unit_of_measure_code) {
      return res.status(400).json({
        error: "Missing cmp_code or item_unit_of_measure_code",
      });
    }

    const cacheKey = `item_uom:${cmp_code}:${item_unit_of_measure_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const query = `
      SELECT *
      FROM posdb.item_unit_of_measure
      WHERE cmp_code = $1 AND item_unit_of_measure_code = $2
    `;

    const result = await pool.query(query, [
      cmp_code,
      item_unit_of_measure_code,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Item Unit of Measure not found",
      });
    }

    const data = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Failed to fetch Item Unit Of Measure:", error);

    return res.status(500).json({
      message: "Failed to Fetch Item Unit of Measure Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
