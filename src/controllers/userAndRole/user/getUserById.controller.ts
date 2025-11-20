import { Request, Response } from "express";
import { pool } from "../../../db/index";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await pool.query(
      "SELECT * FROM posdb.users WHERE user_code = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error(" Error fetching user:", error);
    return res.status(500).json({
      error: "Failed to fetch user",
      status: "fail",
      details: error.message,
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
