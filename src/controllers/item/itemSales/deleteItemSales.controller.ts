import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteItemSales = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const rec of ids) {
        const { sales_code, item_code, starting_date } = rec;

        if (!sales_code || !item_code || !starting_date) {
          return res.status(400).json({
            message:"Missing sales_code, item_code, or starting_date in one of the records",
          });
        }

        const startingDateISO = new Date(starting_date).toISOString();

        // 🔍 CHECK IF RECORD EXISTS
        const checkQuery = `
          SELECT 1 
          FROM posdb.sales_price
          WHERE sales_code = $1
            AND item_code = $2
            AND starting_date = $3
          LIMIT 1
        `;

        const checkResult = await client.query(checkQuery, [
          sales_code,
          item_code,
          startingDateISO,
        ]);

        if (checkResult.rowCount === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({
            message: "Record not found for deletion",
            record: {
              sales_code,
              item_code,
              starting_date: starting_date,
            },
          });
        }

        // DELETE RECORD
        const deleteQuery = `
          DELETE FROM posdb.sales_price
          WHERE sales_code = $1
            AND item_code = $2
            AND starting_date = $3
        `;

        await client.query(deleteQuery, [
          sales_code,
          item_code,
          startingDateISO,
        ]);

        // Clear per-record cache
        await redis.del(
          `sales_price:item:${sales_code}:${item_code}:${startingDateISO}`
        );
      }

      // Clear list cache
      await redis.del("sales_price:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Sales deleted successfully",
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
    console.error("Failed to delete Sales:", error);

    return res.status(500).json({
      message: "Failed to delete Sales",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
