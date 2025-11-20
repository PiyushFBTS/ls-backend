import { Request, Response } from "express";
import { pool } from "../../../db/index";

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id: role_code } = req.params;

    if (!role_code) {
      return res.status(400).json({
        error: "Role ID is required",
        status: "fail",
      });
    }

    const result = await pool.query(
      "SELECT * FROM posdb.user_roles WHERE role_code = $1",
      [role_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error(" Failed to Fetch Role:", error);

    return res.status(500).json({
      message: "Failed to Fetch Role",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
