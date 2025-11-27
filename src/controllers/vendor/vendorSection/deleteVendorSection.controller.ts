import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorSection = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "No IDs provided",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: string[] = [];

      for (const section_code of ids) {
        const checkQuery = `
          SELECT 1
          FROM posdb.vendor_section
          WHERE section_code = $1
        `;

        const exists = await client.query(checkQuery, [section_code]);

        if (exists.rowCount === 0) {
          notFound.push(section_code);
          continue;
        }

        const deleteQuery = `
          DELETE FROM posdb.vendor_section
          WHERE section_code = $1
        `;
        await client.query(deleteQuery, [section_code]);

        await redis.del(`vendor_section:${section_code}`);
      }


      await redis.del("vendor_section:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Vendor Section deletion completed",
        deletedCount: ids.length - notFound.length,
        notFound,
        status: "success",
      });

    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Vendor Section deletion error:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Failed to delete Vendor Section:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Section",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
