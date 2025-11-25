import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateItemSales = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const {
      sales_code,
      item_code,
      currency_code,
      starting_date,
      unit_price,
      minimum_quantity,
      ending_date,
      item_unit_of_measure_code,
      item_variant_code,
      cmp_name,
      cmp_code
    } = body;

    // Required field validation
    if (
      !sales_code ||
      !item_code ||
      !currency_code ||
      !starting_date ||
      !unit_price ||
      !minimum_quantity ||
      !ending_date ||
      !item_unit_of_measure_code ||
      !cmp_name ||
      !cmp_code
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      UPDATE posdb.sales_price 
      SET 
        currency_code = $1, 
        unit_price = $2, 
        minimum_quantity = $3, 
        ending_date = $4, 
        item_unit_of_measure_code = $5, 
        item_variant_code = $6,  
        cmp_name = $7,
        cmp_code = $8  
      WHERE sales_code = $9 
        AND item_code = $10 
        AND starting_date = $11
    `;

    const values = [
      currency_code,
      unit_price,
      minimum_quantity,
      ending_date,
      item_unit_of_measure_code,
      item_variant_code ?? null,
      cmp_name,
      cmp_code,
      sales_code,
      item_code,
      starting_date
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "No matching record found to update"
      });
    }

    // Clear cache for this item sales record
    await redis.del(`sales_price:item:${sales_code}:${item_code}:${starting_date}`);
    await redis.del("sales_price:all");

    return res.status(200).json({
      message: "Sales updated successfully",
      status: "success"
    });

  } catch (error: any) {
    console.error("Failed to update Sales:", error);

    return res.status(500).json({
      message: "Failed to Update Sales",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
