import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getItemSalesById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing id param" });
    }

    // Composite key format: "S001__ITEM01__2024-01-01"
    const [salesCode, itemCode, startingDate] = id.split("__");

    if (!salesCode || !itemCode || !startingDate) {
      return res.status(400).json({
        error: "Invalid composite key format. Expected: sales__item__date",
      });
    }

    const cacheKey = `sales_price:item:${salesCode}:${itemCode}:${startingDate}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: itemSalesById");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: itemSalesById");

    const query = `
      SELECT 
        sales_code, item_code, currency_code, starting_date, 
        unit_price, minimum_quantity, ending_date,
        item_unit_of_measure_code, item_variant_code,
        cmp_code, cmp_name
      FROM posdb.sales_price
      WHERE sales_code = $1
        AND item_code = $2
        AND starting_date = $3
    `;

    const result = await pool.query(query, [
      salesCode,
      itemCode,
      startingDate,
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
