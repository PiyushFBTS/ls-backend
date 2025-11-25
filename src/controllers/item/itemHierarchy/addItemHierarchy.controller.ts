import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const addItemHierarchy = async (req: Request, res: Response) => {
  try {
    const { 
      level, 
      category_code, 
      category_name, 
      parent_code, 
      cmp_name, 
      cmp_code 
    } = req.body;

    // Validation
    if (!level || !category_code || !category_name || !cmp_code) {
      return res.status(400).json({
        error: "Missing required fields (level, category_code, category_name, cmp_code)"
      });
    }

    const query = `
      INSERT INTO posdb.item_hierarchy (
        level, 
        category_code, 
        category_name, 
        parent_code,
        cmp_name, 
        cmp_code
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
      level,
      category_code,
      category_name,
      parent_code,
      cmp_name,
      cmp_code
    ];

    await pool.query(query, values);

    // Clear hierarchical cache if exists
    await redis.del("item_hierarchy:all");
    await redis.del(`item_hierarchy:cmp:${cmp_code}`);

    return res.status(200).json({
      message: "Item Hierarchy added successfully"
    });

  } catch (error: any) {
    console.error("Error adding item hierarchy:", error);

    return res.status(500).json({
      message: "Failed to create Item Hierarchy",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
