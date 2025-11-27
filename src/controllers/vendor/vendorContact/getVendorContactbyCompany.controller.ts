import { Request, Response } from "express";
import { pool } from "../../../db";

export const getVendorContactByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // cmp_code

    if (!id) {
      return res.status(400).json({ error: "cmp_code is required" });
    }

    const result = await pool.query(
      "SELECT * FROM posdb.vendor_contact WHERE cmp_code = $1",
      [id]
    );

    return res.status(200).json(result.rows);

  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to Fetch Vendor Contacts",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
