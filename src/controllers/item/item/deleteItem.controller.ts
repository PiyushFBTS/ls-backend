import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    // Validate incoming records
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: Array<{ item_code: string; cmp_code: string }> = [];

      for (const rec of records) {
        const { item_code, cmp_code } = rec;

        if (!item_code || !cmp_code) {
          return res.status(400).json({
            message:
              "Each record must include item_code and cmp_code",
          });
        }

        // 1️⃣ Check if record exists
        const existsQuery = `
          SELECT 1 
          FROM posdb.item 
          WHERE item_code = $1 AND cmp_code = $2
        `;
        const existsResult = await client.query(existsQuery, [
          item_code,
          cmp_code,
        ]);

        if (existsResult.rowCount === 0) {
          notFound.push({ item_code, cmp_code });
          continue;
        }

        // 2️⃣ Delete the record
        const deleteQuery = `
          DELETE FROM posdb.item
          WHERE item_code = $1 AND cmp_code = $2
        `;

        await client.query(deleteQuery, [item_code, cmp_code]);

        // 3️⃣ Clear Redis for this item
        await redis.del(`item:${cmp_code}:${item_code}`);
      }

      // Clear list cache
      await redis.del("items:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Item deletion completed",
        deletedCount: records.length - notFound.length,
        notFound,
        status: "success",
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DB error during delete:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Failed to delete items:", error);

    return res.status(500).json({
      message: "Failed to Delete Item",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
