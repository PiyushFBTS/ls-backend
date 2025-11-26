import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteUnitOfMeasure = async (req: Request, res: Response) => {
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
        const { uom_code, cmp_code } = rec;

        if (!uom_code || !cmp_code) {
          return res.status(400).json({
            message: "Missing uom_code or cmp_code in one of the records",
          });
        }

        const deleteQuery = `
          DELETE FROM posdb.unit_of_measure
          WHERE uom_code = $1 AND cmp_code = $2
        `;

        await client.query(deleteQuery, [uom_code, cmp_code]);

        // Clear Redis cache for this UOM
        await redis.del(`uom:${cmp_code}:${uom_code}`);
      }

      // Clear list cache
      await redis.del("uom:all");

      await client.query("COMMIT");

      return res.status(200).json({
        message: "Unit of Measure deleted successfully",
        status: "success",
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("DB Error during UOM delete:", err);

      return res.status(500).json({
        message: "Database delete failed",
        error: err,
        status: "fail",
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Delete UOM error:", error);

    return res.status(500).json({
      message: "Failed to delete Unit of Measure",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
