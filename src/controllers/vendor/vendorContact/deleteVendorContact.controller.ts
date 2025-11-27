import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorContact = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No records provided for deletion" });
    }

    // Validate each item
    for (const item of items) {
      if (!item.cmp_code || !item.contact_code) {
        return res.status(400).json({
          message: "Each record must include cmp_code and contact_code",
        });
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: Array<{ cmp_code: string; contact_code: string }> = [];

      for (const item of items) {
        const { cmp_code, contact_code } = item;

        // 1️⃣ Check if record exists
        const checkQuery = `
          SELECT 1 
          FROM posdb.vendor_contact
          WHERE cmp_code = $1 AND contact_code = $2
        `;
        const checkResult = await client.query(checkQuery, [cmp_code, contact_code]);

        if (checkResult.rowCount === 0) {
          notFound.push({ cmp_code, contact_code });
          continue;
        }

        // 2️⃣ Delete the record
        const deleteQuery = `
          DELETE FROM posdb.vendor_contact
          WHERE cmp_code = $1 AND contact_code = $2
        `;
        await client.query(deleteQuery, [cmp_code, contact_code]);

        // 3️⃣ Delete individual Redis cache
        await redis.del(`vendor_contact:${cmp_code}:${contact_code}`);
      }

      // 4️⃣ Clear list cache
      await redis.del("vendor_contact:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Vendor Contact deletion completed",
        deletedCount: items.length - notFound.length,
        notFound,
        status: "success",
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error during vendor contact deletion:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Failed to delete Vendor Contact:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Contact",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
