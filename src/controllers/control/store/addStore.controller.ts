import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';
import { StoreFormValues } from '../../../schemas/control/store/store.schema';

export const addStore = async (req: Request, res: Response) => {
  try {
    const body = req.body as StoreFormValues;

    if (!pool) {
      return res
        .status(500)
        .json({ error: 'Database connection not available' });
    }

    const {
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      sg_code,
      sg_name,
      store_code,
      store_name,
      add1,
      add2,
      country_code,
      state_code,
      city_code,
      pin,
      phone,
      email,
      contact_person,
      contact_phone,
      contact_mail,
      blocked,
      vat_regn_no,
      tan_no,
      gstin,
      arn_no,
      tcan_no,
      pan_no,
      restaurant,
      currency_code,
      inventory_check,
      pos_no_series,
      pine_lab_integration,
      paytm_integration,
      network_integration,
      ezetap_integration,
    } = body;

    // Required fields check
    if (
      !cmp_code ||
      !cmp_name ||
      !ou_code ||
      !ou_name ||
      !sg_code ||
      !sg_name ||
      !store_code ||
      !store_name ||
      !add1 ||
      !country_code ||
      !state_code ||
      !city_code ||
      !pin
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        status: 'fail',
      });
    }

    // Check if store already exists
    const checkQuery = `SELECT store_code FROM posdb.store WHERE store_code = $1`;
    const existing = await pool.query(checkQuery, [store_code]);

    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ error: "Store with this ID already exists" });
    }

    const query = `
      INSERT INTO posdb.store (
        cmp_code, cmp_name, ou_code, ou_name, sg_code, sg_name,
        store_code, store_name, add1, add2, country_code, state_code,
        city_code, pin, phone, email, contact_person, contact_phone, contact_mail,
        blocked, vat_regn_no, tan_no, gstin, arn_no, tcan_no, pan_no,
        restaurant, currency_code, inventory_check, pos_no_series,
        pine_lab_integration, paytm_integration, network_integration, ezetap_integration
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31, $32, $33, $34
      )
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      sg_code,
      sg_name,
      store_code,
      store_name,
      add1,
      add2,
      country_code,
      state_code,
      city_code,
      pin,
      phone,
      email,
      contact_person,
      contact_phone,
      contact_mail,
      blocked,
      vat_regn_no,
      tan_no,
      gstin,
      arn_no,
      tcan_no,
      pan_no,
      restaurant,
      currency_code,
      inventory_check,
      pos_no_series,
      pine_lab_integration,
      paytm_integration,
      network_integration,
      ezetap_integration,
    ];

    // Execute query
    await pool.query(query, values);

    //  Clear Redis cache
    try {
      await redis.del('stores:all');
      await redis.del(`stores:company:${cmp_code}`);
      await redis.del(`stores:ou:${ou_code}`);
      await redis.del(`stores:storeGroup:${sg_code}`);
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate Redis cache for Store:', cacheErr);
    }

    //  Return success
    return res.status(200).json({
      message: 'Store created successfully',
      status: 'success',
    });
  } catch (error: any) {
    console.error(' Failed to create Store:', error);
    return res.status(500).json({
      message: 'Failed to create Store',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
