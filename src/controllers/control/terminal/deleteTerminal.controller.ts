import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const deleteTerminal = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    // Validate request
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No records provided" });
    }

    // Validate composite keys
    for (const rec of records) {
      if (!rec.cmp_code || !rec.terminal_id) {
        return res.status(400).json({
          message: "Each record must include cmp_code and terminal_id",
        });
      }
    }

    const cmpCodes = records.map((r) => r.cmp_code);
    const terminalIds = records.map((r) => r.terminal_id);

    // DELETE using composite key (cmp_code, terminal_id)
    const deleteQuery = `
      DELETE FROM posdb.terminal
      WHERE (cmp_code, terminal_id) IN (
        SELECT * FROM UNNEST($1::text[], $2::text[])
      )
    `;

    const result = await pool.query(deleteQuery, [cmpCodes, terminalIds]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No terminals deleted (not found)",
      });
    }

    // Invalidate Redis Cache
    try {
      await redis.del("terminals:all");

      const pipeline = redis.pipeline();
      records.forEach((r) =>
        pipeline.del(`terminal:${r.cmp_code}:${r.terminal_id}`)
      );
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn("Failed to invalidate terminal cache:", cacheErr);
    }

    // Return success
    return res.status(200).json({
      message: "Terminals deleted successfully",
      deletedCount: result.rowCount,
      status: "success",
    });
  } catch (error: any) {
    console.error("Failed to delete Terminal(s):", error);
    return res.status(500).json({
      message: "Failed to delete Terminal(s)",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
