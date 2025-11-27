import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteVendorAssesseeCode = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate incoming data
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const notFound: string[] = [];

      for (const id of ids) {
        if (!id) {
          return res.status(400).json({
            message: "Each record must include assessee_code",
          });
        }

        // 1️⃣ Check if record exists
        const existsQuery = `
          SELECT 1
          FROM posdb.vendor_assessee_code
          WHERE assessee_code = $1
        `;
        const existsResult = await client.query(existsQuery, [id]);

        if (existsResult.rowCount === 0) {
          notFound.push(id);
          continue;
        }

        // 2️⃣ Delete the record
        const deleteQuery = `
          DELETE FROM posdb.vendor_assessee_code
          WHERE assessee_code = $1
        `;
        await client.query(deleteQuery, [id]);

        // 3️⃣ Clear Redis for this specific code
        await redis.del(`vendor_assessee_code:${id}`);
      }

      // 4️⃣ Clear list cache
      await redis.del("vendor_assessee_code:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Vendor Assessee Code deletion completed",
        deletedCount: ids.length - notFound.length,
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
    console.error("Failed to delete Vendor Assessee Codes:", error);

    return res.status(500).json({
      message: "Failed to delete Vendor Assessee Code",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
