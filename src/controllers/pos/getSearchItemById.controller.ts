import { Request, Response } from "express";
import { pool } from "../../db";
import { redis } from "../../db/redis";

export const getPOSItemSales = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({
        error: "cmp_code is required",
      });
    }

    const cacheKey = `pos_item_sales:${id}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("Serving POS item sales from Redis cache");
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.error("Redis GET error:", cacheErr);
    }

    const query = `
      SELECT 
        i.item_code,
        i.description,
        i.item_category_code,
        s.sales_code,
        s.unit_price,
        g.gst_percentage,
        s.starting_date,
        s.ending_date
      FROM posdb.item i
      INNER JOIN posdb.sales_price s
        ON i.item_code = s.item_code
      INNER JOIN posdb.gst_group g
        ON i.gst_group_code = g.gst_group_code
      WHERE CURRENT_DATE BETWEEN s.starting_date AND s.ending_date
        AND i.cmp_code = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Item for POS not found",
      });
    }

    const data = result.rows;

    try {
      await redis.set(cacheKey, JSON.stringify(data), "EX", 60 * 5); // Cache for 5 minutes
    } catch (cacheErr) {
      console.error("Redis SET error:", cacheErr);
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Error fetching POS item sales:", error);

    return res.status(500).json({
      message: "Failed to fetch item sales data",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
