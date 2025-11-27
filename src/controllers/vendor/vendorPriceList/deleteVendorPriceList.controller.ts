import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorPriceList = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No records provided",
      });
    }

    // Validate each entry
    for (const item of items) {
      if (!item.price_list_code || !item.cmp_code) {
        return res.status(400).json({
          message: "Each item must include price_list_code and cmp_code",
        });
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: Array<{ price_list_code: string; cmp_code: string }> = [];

      for (const item of items) {
        const { price_list_code, cmp_code } = item;

        const existsQuery = `
          SELECT 1
          FROM posdb.vendor_price_list
          WHERE price_list_code = $1 AND cmp_code = $2
        `;

        const existsRes = await client.query(existsQuery, [
          price_list_code,
          cmp_code,
        ]);

        if (existsRes.rowCount === 0) {
          notFound.push({ price_list_code, cmp_code });
          continue;
        }

        const deleteQuery = `
          DELETE FROM posdb.vendor_price_list
          WHERE price_list_code = $1 AND cmp_code = $2
        `;
        await client.query(deleteQuery, [price_list_code, cmp_code]);

        await redis.del(`vendor_price_list:${cmp_code}:${price_list_code}`);
      }

      await redis.del("vendor_price_list:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Vendor Price List deletion completed",
        deletedCount: items.length - notFound.length,
        notFound,
        status: "success",
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error during Vendor Price List deletion:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Failed to delete Vendor Price List:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Price List",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
