import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { role_code, role_name, role_description, cmp_code, cmp_name } = req.body;

    if (!role_code || !role_name || !role_description || !cmp_code || !cmp_name) {
      return res.status(400).json({
        error: "Missing required fields",
        status: "fail",
      });
    }

    // Equivalent to session user
    const currentUser = req.headers["x-user"] || "system";
    const currentTime = new Date();

    const query = `
      UPDATE posdb.user_roles SET
        role_name = $1,
        role_description = $2,
        modified_by = $3,
        modified_on = $4,
        cmp_code = $5,
        cmp_name = $6
      WHERE role_code = $7
    `;

    const values = [
      role_name,
      role_description,
      currentUser,
      currentTime,
      cmp_code,
      cmp_name,
      role_code
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Clear Redis caches if stored
    try {
      await redis.del("roles:all");
      await redis.del(`roles:company:${cmp_code}`);
    } catch (err) {
      console.warn(" Failed to clear Redis cache after role update:", err);
    }

    return res.status(200).json({
      message: "Role updated successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error(" Failed to Update Role:", error);

    return res.status(500).json({
      message: "Failed to Update Roles",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
