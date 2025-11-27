import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorMaster = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    // items must be: [{ cmp_code: "CMP01", vendor_code: "V001" }, ...]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No vendor records provided" });
    }

    // Extract values into SQL arrays
    const cmpCodes = items.map((item) => item.cmp_code);
    const vendorCodes = items.map((item) => item.vendor_code);

    if (cmpCodes.includes(undefined) || vendorCodes.includes(undefined)) {
      return res.status(400).json({
        message: "Each item must contain cmp_code and vendor_code",
      });
    }

    // Check if records exist before deletion
    const checkQuery = `
      SELECT cmp_code, vendor_code
      FROM posdb.vendor_master
      WHERE cmp_code = ANY($1::text[])
      AND vendor_code = ANY($2::text[])
    `;

    const checkResult = await pool.query(checkQuery, [cmpCodes, vendorCodes]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "No matching vendor records found to delete",
      });
    }

    // Check which records were not found
    const foundRecords = checkResult.rows.map(
      (row) => `${row.cmp_code}:${row.vendor_code}`
    );
    const requestedRecords = items.map(
      (item) => `${item.cmp_code}:${item.vendor_code}`
    );
    const notFoundRecords = requestedRecords.filter(
      (record) => !foundRecords.includes(record)
    );

    // Proceed with deletion
    const deleteQuery = `
      DELETE FROM posdb.vendor_master
      WHERE cmp_code = ANY($1::text[])
      AND vendor_code = ANY($2::text[])
    `;

    await pool.query(deleteQuery, [cmpCodes, vendorCodes]);

    // Clear caches
    try {
      await redis.del("vendor_master:all");

      for (const item of items) {
        await redis.del(`vendor_master:vendor:${item.vendor_code}`);
        await redis.del(`vendor_master:cmp:${item.cmp_code}`);
      }
    } catch (err) {
      console.error("Redis cache clear error:", err);
    }

    return res.status(200).json({
      message: "Vendors deleted successfully",
      deletedCount: checkResult.rows.length,
      notFound: notFoundRecords.length > 0 ? notFoundRecords : undefined,
    });

  } catch (error: any) {

    return res.status(500).json({
      message: "Failed to delete Vendor",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};