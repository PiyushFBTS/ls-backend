import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";
import { TerminalFormValues } from "../../../schemas/control/terminal/terminal.schema";

export const addTerminal = async (req: Request, res: Response) => {
  try {
    const body = req.body as TerminalFormValues;

    if (!pool) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    const { cmp_code, cmp_name, ou_code, ou_name, store_code, store_name, terminal_id } = body;

    // Validate required fields
    if (!cmp_code || !cmp_name || !ou_code || !ou_name || !store_code || !store_name || !terminal_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if terminal already exists
    const checkQuery = `SELECT terminal_id FROM posdb.terminal WHERE terminal_id = $1`;
    const existing = await pool.query(checkQuery, [terminal_id]);

    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ error: "Terminal with this ID already exists" });
    }


    // Insert terminal
    const insertQuery = `
      INSERT INTO posdb.terminal (
        cmp_code, cmp_name, ou_code, ou_name, store_code, store_name, terminal_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [cmp_code, cmp_name, ou_code, ou_name, store_code, store_name, terminal_id];
    await pool.query(insertQuery, values);

    // 4️⃣ Invalidate related Redis caches
    try {
      await redis.del("terminals:all");
      await redis.del(`terminals:store:${store_code}`);
      await redis.del(`terminals:company:${cmp_code}`);
      await redis.del(`terminals:ou:${ou_code}`);
    } catch (cacheErr) {
      console.warn("⚠️ Failed to clear Redis cache after terminal insert:", cacheErr);
    }

    // 5️⃣ Return success
    return res.status(200).json({
      message: "Terminal created successfully",
      status: "success",
    });
  } catch (error: any) {
    console.error("❌ Failed to create Terminal:", error);
    return res.status(500).json({
      message: "Failed to create Terminal",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
