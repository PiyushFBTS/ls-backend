import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const addUser = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const { role_code, role_name, user_name, user_full_name, user_mobile, user_email, user_pass, cmp_code, cmp_name,blocked } = body;

    // Basic validation
    if (!role_code || !role_name || !user_name || !user_full_name || !user_mobile || !user_email || !user_pass || !cmp_code || !cmp_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Determine current user (node equivalent of getServerSession)
    const currentUser = req.headers["x-user"] || "system";
    const currentTime = new Date();

    const query = `
      INSERT INTO posdb.users (
        role_code,
        role_name,
        user_name,
        user_full_name,
        user_mobile,
        user_email,
        user_pass,
        cmp_code,
        cmp_name,
        last_login,
        blocked,
        blocked_by,
        blocked_on,
        created_by,
        created_on,
        modified_by,
        modified_on
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17
      )
      RETURNING user_code;
    `;

    const values = [
      role_code,
      role_name,
      user_name,
      user_full_name,
      user_mobile,
      user_email,
      user_pass,
      cmp_code,
      cmp_name,
      null,     
      blocked ?? 'N',      // blocked
      null,     // blocked_by
      null,     // blocked_on
      currentUser,
      currentTime,
      null,     // modified_by
      null,     // modified_on
    ];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    const user_code = result.rows[0]?.user_code;

    try {
      await redis.del("users:all");
      await redis.del(`users:company:${cmp_code}`);
    } catch (err) {
      console.warn(" Failed to clear Redis cache after user insert:", err);
    }

    return res.status(201).json({
      status: "success",
      user_code,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error(" Failed to create user:", error);
    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
