import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    // Validate input
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    // Validate each record
    for (const rec of records) {
      if (!rec.store_code || !rec.cmp_code) {
        return res.status(400).json({
          message: "Each record must include cmp_code and store_code",
        });
      }
    }

    const storeCodes = records.map((r) => r.store_code);
    const cmpCodes = records.map((r) => r.cmp_code);

    // Check for dependent terminals (based only on store_code)
    const terminalQuery = `
      SELECT terminal_id
      FROM posdb.terminal
      WHERE store_code = ANY($1::text[])
    `;
    const terminalResult = await pool.query(terminalQuery, [storeCodes]);

    if (terminalResult.rows.length > 0) {
      return res.status(400).json({
        message:
          "Store cannot be deleted because one or more terminals are assigned to it.",
      });
    }

    // Delete based on composite key (cmp_code + store_code)
    const deleteQuery = `
      DELETE FROM posdb.store
      WHERE (cmp_code, store_code) IN (
        SELECT * FROM UNNEST($1::text[], $2::text[])
      )
    `;

    const deleteResult = await pool.query(deleteQuery, [cmpCodes, storeCodes]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "No stores deleted (not found)" });
    }

    // Invalidate Redis Cache
    try {
      await redis.del("stores:all");

      const pipeline = redis.pipeline();
      records.forEach((r) =>
        pipeline.del(`store:${r.cmp_code}:${r.store_code}`)
      );
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn("Failed to invalidate store cache:", cacheErr);
    }

    return res.status(200).json({
      message: "Store deleted successfully",
      deletedCount: deleteResult.rowCount,
      status: "success",
    });
  } catch (error: any) {
    console.error("Failed to delete Store:", error);

    return res.status(500).json({
      message: "Failed to Delete Store",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
