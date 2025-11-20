import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const updateStore = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!pool) {
      return res.status(500).json({ error: 'Database connection not available' });
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

    // Validate required fields
    if (!store_code) {
      return res.status(400).json({ error: 'Missing store_code for update' });
    }

    //  Update query
    const query = `
      UPDATE posdb.store SET
        cmp_code = $1,
        cmp_name = $2,
        ou_code = $3,
        ou_name = $4,
        sg_code = $5,
        sg_name = $6,
        store_name = $7,
        add1 = $8,
        add2 = $9,
        country_code = $10,
        state_code = $11,
        city_code = $12,
        pin = $13,
        phone = $14,
        email = $15,
        contact_person = $16,
        contact_phone = $17,
        contact_mail = $18,
        blocked = $19,
        vat_regn_no = $20,
        tan_no = $21,
        gstin = $22,
        arn_no = $23,
        tcan_no = $24,
        pan_no = $25,
        restaurant = $26,
        currency_code = $27,
        inventory_check = $28,
        pos_no_series = $29,
        pine_lab_integration = $30,
        paytm_integration = $31,
        network_integration = $32,
        ezetap_integration = $33
      WHERE store_code = $34
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      sg_code,
      sg_name,
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
      store_code,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Invalidate Redis cache (important!)
    try {
      await redis.del('stores:all');
      await redis.del(`store:${store_code}`);
      await redis.del(`stores:company:${cmp_code}`);
      await redis.del(`stores:storeGroup:${sg_code}`);
      await redis.del(`stores:ou:${ou_code}`);
    } catch (cacheErr) {
      console.warn(' Failed to clear Redis cache for updated Store:', cacheErr);
    }

    //  Success response
    return res.status(200).json({
      message: 'Store updated successfully',
      status: 'success',
    });
  } catch (error: any) {
    console.error(' Failed to update store:', error);
    return res.status(500).json({
      message: 'Failed to update Store',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
