import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { ItemVariantType } from "../../../schemas/item/itemVariant.schema";

export const addItemVariant = async (req: Request, res: Response) => {
  try {
    // Validate using Zod

    const body = req.body as ItemVariantType;

    const { item_variant_code, item_code, description, cmp_name, cmp_code, } = body;

    const query = `
      INSERT INTO posdb.item_variant (
        item_variant_code, item_code, description, cmp_name, cmp_code
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    const values = [
      item_variant_code,
      item_code,
      description,
      cmp_name,
      cmp_code,
    ];

    await pool.query(query, values);

    // Optional cache clear
    try {
      await redis.del("item_variant:all");
      await redis.del(`item_variant:${cmp_code}`);
    } catch { }

    return res.status(200).json({
      message: "Item Variant created successfully",
      status: "success",
    });
  } catch (error: any) {
    console.error("Failed to create Item Variant:", error);

    return res.status(500).json({
      message: "Failed to Create Item Variant",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
