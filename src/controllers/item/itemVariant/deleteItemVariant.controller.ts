import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteItemVariant = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    // Validate input
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const rec of records) {
        const { item_variant_code, cmp_code } = rec;

        if (!item_variant_code || !cmp_code) {
          return res.status(400).json({
            message: "Missing item_variant_code or cmp_code in one of the records",
          });
        }

        // 🔍 Check if record exists BEFORE deleting
        const checkQuery = `
          SELECT 1 
          FROM posdb.item_variant 
          WHERE item_variant_code = $1 AND cmp_code = $2
          LIMIT 1
        `;

        const checkResult = await client.query(checkQuery, [
          item_variant_code,
          cmp_code,
        ]);

        if (checkResult.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({
            message: `Item Variant not found for: variant_code=${item_variant_code}, cmp_code=${cmp_code}`,
          });
        }

        // 🗑 Delete the record
        const deleteQuery = `
          DELETE FROM posdb.item_variant
          WHERE item_variant_code = $1
          AND cmp_code = $2
        `;

        await client.query(deleteQuery, [item_variant_code, cmp_code]);

        // ♻️ Clear per-record cache
        await redis.del(`item_variant:${cmp_code}:${item_variant_code}`);
      }

      // ♻️ Clear list cache
      await redis.del("item_variant:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Item Variant(s) deleted successfully",
        status: "success",
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Delete variant DB error:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Failed to delete Item Variant:", error);

    return res.status(500).json({
      message: "Failed to delete Item Variant",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
