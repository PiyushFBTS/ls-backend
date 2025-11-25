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

      for (const record of ids) {
        const { sales_code, item_code, starting_date } = record;

        if (!sales_code || !item_code || !starting_date) {
          return res.status(400).json({
            message: "Missing sales_code, item_code, or starting_date in one of the records",
          });
        }

        // Convert date to ISO to match DB (important)
        const startingDateISO = new Date(starting_date).toISOString();

        const deleteQuery = `
          DELETE FROM posdb.sales_price
          WHERE sales_code = $1
            AND item_code = $2
            AND starting_date = $3
        `;

        await client.query(deleteQuery, [
          sales_code,
          item_code,
          startingDateISO
        ]);

        // Clear cache for each deleted record
        await redis.del(`sales_price:item:${sales_code}:${item_code}:${startingDateISO}`);
      }

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
