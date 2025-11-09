import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const deleteTerminal = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // 1️⃣ Validate IDs array
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    // 2️⃣ Delete terminals from DB
    const query = `
      DELETE FROM posdb.terminal
      WHERE terminal_id = ANY($1::text[])
    `;
    const result = await pool.query(query, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No terminals deleted (not found)" });
    }

    // 3️⃣ Invalidate Redis cache
    try {
      await redis.del("terminals:all");
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`terminal:${id}`));
      await pipeline.exec();
      console.log("🧹 Redis terminal cache cleared");
    } catch (cacheErr) {
      console.warn("⚠️ Failed to invalidate Redis cache after terminal deletion:", cacheErr);
    }

    // 4️⃣ Return success
    return res.status(200).json({
      message: "Terminals deleted successfully",
      deletedCount: result.rowCount,
      status: "success",
    });
  } catch (error: any) {
    console.error("❌ Failed to delete Terminal(s):", error);
    return res.status(500).json({
      message: "Failed to delete Terminal(s)",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
