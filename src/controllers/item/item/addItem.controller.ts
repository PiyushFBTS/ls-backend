import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";
import { ItemFormType } from "../../../schemas/item/item.schema";

export const addItem = async (req: Request, res: Response) => {
  try {
    const body = req.body as ItemFormType;

    const {
      item_code,
      description,
      base_unit_of_measure,
      gross_weight,
      net_weight,
      division,
      item_category_code,
      product_group_code,
      picture,
      lot_nos,
      gst_group_code,
      hsn_sac_code,
      exempted,
      price_include_gst,
      restaurant_gst_group_code,
      restaurant_hsn_sac_code,
      special_group_code,
      qty_not_in_decimal,
      oum_pop_up_on_pos,
      sales_unit_of_measure,
      zero_price_valid,
      no_discount_allowed,
      qty_becomes_negative,
      keying_in_price,
      keying_in_quantity,
      skip_compression_when_scanned,
      variant_aplicable,
      cmp_name,
      cmp_code,
    } = body;

    // Convert Base64 Image → Buffer
    let pictureBuffer = null;
    if (picture) {
      const base64 = picture.split(",")[1];
      pictureBuffer = Buffer.from(base64, "base64");
    }

    const query = `
      INSERT INTO posdb.item (
        item_code, description, base_unit_of_measure, gross_weight, net_weight,
        division, item_category_code, product_group_code, picture, lot_nos,
        gst_group_code, hsn_sac_code, exempted, price_include_gst,
        restaurant_gst_group_code, restaurant_hsn_sac_code, special_group_code,
        qty_not_in_decimal, oum_pop_up_on_pos, sales_unit_of_measure,
        zero_price_valid, no_discount_allowed, qty_becomes_negative,
        keying_in_price, keying_in_quantity, skip_compression_when_scanned,
        variant_aplicable, cmp_name, cmp_code
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,$27,$28,$29
      )
    `;

    const values = [
      item_code,
      description,
      base_unit_of_measure,
      gross_weight,
      net_weight,
      division,
      item_category_code,
      product_group_code,
      pictureBuffer,
      lot_nos,
      gst_group_code,
      hsn_sac_code,
      exempted,
      price_include_gst,
      restaurant_gst_group_code,
      restaurant_hsn_sac_code,
      special_group_code,
      qty_not_in_decimal,
      oum_pop_up_on_pos,
      sales_unit_of_measure,
      zero_price_valid,
      no_discount_allowed,
      qty_becomes_negative,
      keying_in_price,
      keying_in_quantity,
      skip_compression_when_scanned,
      variant_aplicable,
      cmp_name,
      cmp_code,
    ];

    await pool.query(query, values);

    // Clear item list cache
    await redis.del("items:all");

    return res.status(200).json({
      message: "Item added successfully",
    });
  } catch (error: any) {
    console.error("Item Insert Error:", error);
    return res.status(500).json({
      message: "Failed to create item",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
