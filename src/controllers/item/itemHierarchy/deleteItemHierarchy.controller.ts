import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteItemHierarchy = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const query = `
      DELETE FROM posdb.item_hierarchy
      WHERE category_code = ANY($1::text[])
    `;

    await pool.query(query, [ids]);

    // Clear related caches
    await redis.del("item_hierarchy:all");

    ids.forEach(async (id) => {
      await redis.del(`item_hierarchy:${id}`);
    });

    return res
      .status(200)
      .json({ message: "Item Hierarchy deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting Item Hierarchy:", error);

    return res.status(500).json({
      message: "Failed to Delete Item Hierarchy",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN")
    });
  }
};
