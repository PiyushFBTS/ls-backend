import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateItemHierarchy = async (req: Request, res: Response) => {
  try {
    const {
      level,
      category_code,
      category_name,
      parent_code,
      cmp_name,
      cmp_code
    } = req.body;

    // VALIDATION
    if (!category_code) {
      return res.status(400).json({
        error: "Missing category_code"
      });
    }

    const query = `
      UPDATE posdb.item_hierarchy SET
        level = $1,
        category_name = $2,
        parent_code = $3,
        cmp_name = $4,
        cmp_code = $5
      WHERE category_code = $6
    `;

    const values = [
      level,
      category_name,
      parent_code,
      cmp_name,
      cmp_code,
      category_code
    ];

    await pool.query(query, values);

    // Clear cache for this item + entire list
    await redis.del("item_hierarchy:all");
    await redis.del(`item_hierarchy:${category_code}`);
    if (cmp_code) await redis.del(`item_hierarchy:cmp:${cmp_code}`);

    return res
      .status(200)
      .json({ message: "Item Hierarchy updated successfully" });

  } catch (error: any) {
    console.error("Error updating Item Hierarchy:", error);

    return res.status(500).json({
      message: "Failed to Update Item Hierarchy",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
