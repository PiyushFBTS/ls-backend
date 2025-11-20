import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const addRole = async (req: Request, res: Response) => {
  try {
    const { role_name, role_description, cmp_code, cmp_name } = req.body;

    // Validate required fields
    if (!role_name || !role_description || !cmp_code || !cmp_name) {
      return res.status(400).json({
        error: "Missing required fields",
        status: "fail",
      });
    }

    // Simulate NextAuth user (from header or fallback)
    const currentUser = req.headers["x-user"] || "system";
    const currentTime = new Date();

    const query = `
      INSERT INTO posdb.user_roles (
        role_name, role_description, created_by, created_on, cmp_code, cmp_name
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING role_code, role_name, cmp_code, cmp_name
    `;

    const values = [role_name, role_description, currentUser, currentTime, cmp_code, cmp_name,];

    const result = await pool.query(query, values);

    // Clear Redis cache (if roles list is cached)
    try {
      await redis.del("roles:all");
      await redis.del(`roles:company:${cmp_code}`);
    } catch (err) {
      console.warn(" Failed to clear Redis cache after role insert:", err);
    }

    return res.status(200).json({
      message: "Role Created Successfully",
      status: "success",
      role: result.rows[0],
    });

  } catch (error: any) {
    console.error(" Failed to Create Role:", error);

    return res.status(500).json({
      message: "Failed to Create Role",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
