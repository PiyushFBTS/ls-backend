import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemSalesById = async (req: Request, res: Response) => {
  try {
    const { sales_code, item_code, starting_date, cmp_code } = req.query;

    // Validate inputs
    if (!sales_code || !item_code || !starting_date || !cmp_code) {
      return res.status(400).json({
        error: "Missing required query parameters: sales_code, item_code, starting_date,cmp_code",
      });
    }

    // Convert starting_date → yyyy-mm-dd (works with PostgreSQL DATE column)
    const formattedDate = new Date(starting_date as string)
      .toISOString()
      .split("T")[0];

    const cacheKey = `sales_price:item:${cmp_code}:${sales_code}:${item_code}:${formattedDate}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const query = `
      SELECT 
        sales_code, item_code, currency_code, starting_date, 
        unit_price, minimum_quantity, ending_date,
        item_unit_of_measure_code, item_variant_code,
        cmp_code, cmp_name
      FROM posdb.sales_price
      WHERE cmp_code = $1
        AND sales_code = $2
        AND item_code = $3
        AND starting_date = $4
    `;

    const result = await pool.query(query, [
      cmp_code,
      sales_code,
      item_code,
      formattedDate
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item Sales not found" });
    }

    const data = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("Failed to fetch item sales:", error);

    return res.status(500).json({
      message: "Failed to fetch item sales data",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
