import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { ItemSalesFormType } from "../../../schemas/item/itemSales.schema";

export const addItemSales = async (req: Request, res: Response) => {
  try {
    const body = req.body as ItemSalesFormType;

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

    const query = `
      INSERT INTO posdb.sales_price (
        sales_code, item_code, currency_code, starting_date, unit_price,
        minimum_quantity, ending_date, item_unit_of_measure_code,
        item_variant_code, cmp_name, cmp_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `;

    const values = [
      sales_code,
      item_code,
      currency_code,
      starting_date,
      unit_price,
      minimum_quantity,
      ending_date,
      item_unit_of_measure_code,
      item_variant_code ?? null,
      cmp_name,
      cmp_code
    ];

    await pool.query(query, values);

    // Clear cached sales list
    await redis.del("sales_price:all");
    await redis.del(`sales_price:item:${item_code}`);

    return res.status(200).json({
      message: "Sales created successfully",
      status: "success"
    });

  } catch (error: any) {
    console.error("Error creating Sales:", error);

    return res.status(500).json({
      message: "Failed to Create Sales",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
