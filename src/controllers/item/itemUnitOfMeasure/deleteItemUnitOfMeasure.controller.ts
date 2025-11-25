import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const deleteUnitOfMeasure = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    // Validate required fields inside each record
    for (const rec of records) {
      if (!rec.cmp_code || !rec.item_unit_of_measure_code) {
        return res.status(400).json({
          message: "Each record must contain cmp_code and item_unit_of_measure_code",
        });
      }
    }

    // Delete using composite key
    const deleteQuery = `
      DELETE FROM posdb.item_unit_of_measure
      WHERE (cmp_code, item_unit_of_measure_code) IN (
        SELECT * FROM UNNEST($1::text[], $2::text[])
      )
    `;

    const cmpCodes = records.map(r => r.cmp_code);
    const codes = records.map(r => r.item_unit_of_measure_code);

    await pool.query(deleteQuery, [cmpCodes, codes]);

    // Cache cleanup
    await redis.del("item_uom:all");

    records.forEach((r) => {
      redis.del(`item_uom:${r.cmp_code}:${r.item_unit_of_measure_code}`);
    });

    return res.status(200).json({
      message: "Item Unit of Measure deleted successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Failed to delete UOM:", error);

    return res.status(500).json({
      message: "Failed to delete Item Unit of Measure",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
