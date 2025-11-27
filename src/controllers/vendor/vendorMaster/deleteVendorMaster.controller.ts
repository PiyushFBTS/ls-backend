import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorMaster = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No vendor records provided" });
    }

    // Validate incoming fields
    for (const item of items) {
      if (!item.cmp_code || !item.vendor_code) {
        return res.status(400).json({
          message: "Each item must contain cmp_code and vendor_code",
        });
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: Array<{ cmp_code: string; vendor_code: string }> = [];

      for (const item of items) {
        const { cmp_code, vendor_code } = item;

        // 1️⃣ Check if vendor exists
        const existsQuery = `
          SELECT 1
          FROM posdb.vendor_master
          WHERE cmp_code = $1 AND vendor_code = $2
        `;
        const existsResult = await client.query(existsQuery, [
          cmp_code,
          vendor_code,
        ]);

        if (existsResult.rowCount === 0) {
          notFound.push({ cmp_code, vendor_code });
          continue;
        }

        // 2️⃣ Delete from DB
        const deleteQuery = `
          DELETE FROM posdb.vendor_master
          WHERE cmp_code = $1 AND vendor_code = $2
        `;
        await client.query(deleteQuery, [cmp_code, vendor_code]);

        // 3️⃣ Clear individual Redis keys
        await redis.del(`vendor_master:${cmp_code}:${vendor_code}`);
      }

      // 4️⃣ Clear list cache
      await redis.del("vendor_master:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Vendor master deletion completed",
        deletedCount: items.length - notFound.length,
        notFound,
        status: "success",
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Vendor master deletion error:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Failed to delete vendor master:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Master",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
