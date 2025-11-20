import { Request, Response } from "express";
import { pool } from "../../../db/index";
import { redis } from "../../../db/redis";

export const getUserRolesByCompany = async (req: Request, res: Response) => {
  try {
    const { id: cmp_code } = req.params;

    if (!cmp_code) {
      return res.status(400).json({
        message: "Company code is required",
        status: "fail",
      });
    }

    try {
      const cached = await redis.get(`user_roles:company:${cmp_code}`);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    } catch (err) {
      console.warn(" Redis fetch error:", err);
    }

    const query = `
      SELECT 
        u.cmp_code,
        u.cmp_name,
        r.role_name,
        u.user_name,
        u.user_full_name,
        u.user_code
      FROM posdb.users u
      INNER JOIN posdb.user_roles r 
        ON u.role_code = r.role_code
      WHERE u.cmp_code = $1
    `;

    const { rows } = await pool.query(query, [cmp_code]);

    // Cache result
    try {
      await redis.set(`user_roles:company:${cmp_code}`, JSON.stringify(rows));
    } catch (err) {
      console.warn(" Redis cache error:", err);
    }

    return res.status(200).json(rows);

  } catch (error: any) {
    console.error(" Failed to Fetch user roles:", error);

    return res.status(500).json({
      message: "Failed to Fetch user roles",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
