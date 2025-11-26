import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateItemVariant = async (req: Request, res: Response) => {
  try {
    const { item_variant_code, item_code, description, cmp_name, cmp_code } = req.body;

    // Validate input
    if (!item_variant_code || !item_code || !description || !cmp_name || !cmp_code) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      UPDATE posdb.item_variant SET
        item_code = $1,
        description = $2,
        cmp_name = $3,
        cmp_code = $4  
      WHERE item_variant_code = $5
    `;

    const values = [
      item_code,
      description,
      cmp_name,
      cmp_code,
      item_variant_code
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item Variant not found" });
    }

    // Clear cache
    try {
      await redis.del("item_variant:all");
      await redis.del(`item_variant:id:${item_variant_code}`);
    } catch (cacheErr) {
      console.warn("⚠ Failed to clear Item Variant cache:", cacheErr);
    }

    return res.status(200).json({
      message: "Item Variant updated successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Failed to update Item Variant:", error);

    return res.status(500).json({
      message: "Failed to Update Item Variant",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
