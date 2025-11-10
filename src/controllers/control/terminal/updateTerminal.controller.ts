import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const updateTerminal = async (req: Request, res: Response) => {
  try {
    const {
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      store_code,
      store_name,
      terminal_id,
    } = req.body;

    // Validate input
    if (!terminal_id) {
      return res.status(400).json({ error: "Terminal ID is required" });
    }

    if (!cmp_code || !cmp_name || !ou_code || !ou_name || !store_code || !store_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    //  Check database connection
    if (!pool) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    // Update query
    const query = `
      UPDATE posdb.terminal SET
        cmp_code = $1,
        cmp_name = $2,
        ou_code = $3,
        ou_name = $4,
        store_code = $5,
        store_name = $6
      WHERE terminal_id = $7
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      store_code,
      store_name,
      terminal_id,
    ];

    const result = await pool.query(query, values);

    //  Handle not found
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Terminal not found" });
    }

    //  Invalidate Redis cache
    try {
      await redis.del(`terminal:${terminal_id}`);
      await redis.del(`terminals:store:${store_code}`);
      await redis.del(`terminals:company:${cmp_code}`);
      await redis.del(`terminals:ou:${ou_code}`);
      await redis.del("terminals:all");
    } catch (cacheErr) {
      console.warn("⚠️ Failed to invalidate terminal cache:", cacheErr);
    }

    //  Respond success
    return res.status(200).json({
      message: "Terminal updated successfully",
      status: "success",
    });
  } catch (error: any) {
    console.error(" Failed to update terminal:", error);
    return res.status(500).json({
      message: "Failed to Update Terminal",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
