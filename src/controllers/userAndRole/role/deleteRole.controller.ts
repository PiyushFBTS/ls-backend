import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const deleteRoles = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const query = `
      DELETE FROM posdb.user_roles
      WHERE role_code = ANY($1::integer[])
    `;

    await pool.query(query, [ids]);

    try {
      await redis.del("roles:all");
    } catch (err) {
      console.warn(" Failed to clear Redis cache after role deletion:", err);
    }

    return res.status(200).json({
      message: "Role deleted successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error(" Delete Role Error:", error);

    return res.status(500).json({
      message: "Failed to Delete Role",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
