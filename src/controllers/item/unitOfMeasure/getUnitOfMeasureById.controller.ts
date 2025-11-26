import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getUnitOfMeasureById = async (req: Request, res: Response) => {
  try {
    const { uom_code, cmp_code } = req.query;

    if (!uom_code || !cmp_code) {
      return res.status(400).json({
        error: "Missing uom_code or cmp_code",
      });
    }

    const cacheKey = `uom:id:${cmp_code}:${uom_code}`;

    // Check Redis Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const query = `
      SELECT *
      FROM posdb.unit_of_measure
      WHERE uom_code = $1
      AND cmp_code = $2
    `;

    const result = await pool.query(query, [uom_code, cmp_code]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Unit of Measure not found for given uom_code & cmp_code",
      });
    }

    const data = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Failed to fetch Unit of Measure:", error);

    return res.status(500).json({
      message: "Failed to fetch Unit of Measure",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
