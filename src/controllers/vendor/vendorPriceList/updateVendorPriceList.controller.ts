import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const updateVendorPriceList = async (req: Request, res: Response) => {
  try {
    if (!pool) {
      return res.status(500).json({
        error: "Database connection not available",
      });
    }

    const {
      cmp_name, description, assign_to_group, assign_to_type, assign_to_no,
      assign_to_parent_no_projects, assign_to_id, price_type, defines,
      currency_code, starting_date, ending_date, price_includes_vat,
      vat_bus_posting_gr_price, allow_line_disc, allow_invoice_disc,
      no_series, status, filter_source_no, allow_updating_default, assign_to_no_alt,
      assign_to_parent_no_alt, approval_status, cmp_code, price_list_code,
    } = req.body;

    if (!cmp_code || !price_list_code) {
      return res.status(400).json({
        error: "cmp_code and price_list_code are required",
      });
    }

    const query = `
      UPDATE posdb.vendor_price_list
      SET
        cmp_name = $1,
        description = $2,
        assign_to_group = $3,
        assign_to_type = $4,
        assign_to_no = $5,
        assign_to_parent_no_projects = $6,
        assign_to_id = $7,
        price_type = $8,
        defines = $9,
        currency_code = $10,
        starting_date = $11,
        ending_date = $12,
        price_includes_vat = $13,
        vat_bus_posting_gr_price = $14,
        allow_line_disc = $15,
        allow_invoice_disc = $16,
        no_series = $17,
        status = $18,
        filter_source_no = $19,
        allow_updating_default = $20,
        assign_to_no_alt = $21,
        assign_to_parent_no_alt = $22,
        approval_status = $23
      WHERE cmp_code = $24 AND price_list_code = $25
    `;

    const values = [
      cmp_name,
      description,
      assign_to_group,
      assign_to_type,
      assign_to_no,
      assign_to_parent_no_projects,
      assign_to_id,
      price_type,
      defines,
      currency_code,
      starting_date,
      ending_date,
      price_includes_vat,
      vat_bus_posting_gr_price,
      allow_line_disc,
      allow_invoice_disc,
      no_series,
      status,
      filter_source_no,
      allow_updating_default,
      assign_to_no_alt,
      assign_to_parent_no_alt,
      approval_status,
      cmp_code,
      price_list_code,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Vendor Price List not found",
        status: "fail",
      });
    }

    await redis.del("vendorPriceList:all");                                     // all lists
    await redis.del(`vendorPriceList:company:${cmp_code}`);                     // company wise
    await redis.del(`vendorPriceList:${cmp_code}:${price_list_code}`);          // single list

    return res.status(200).json({
      message: "Vendor Price List updated successfully",
      status: "success",
    });

  } catch (error: any) {
    console.error("Error updating Vendor Price List:", error);

    return res.status(500).json({
      message: "Failed to update Vendor Price List",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    });
  }
};
