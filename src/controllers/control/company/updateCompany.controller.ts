import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!pool) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const {
      cmp_code,
      cmp_name,
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
      cmp_logo,
      pan_no,
    } = body;

    if (!cmp_code) {
      return res.status(400).json({ error: 'cmp_code is required' });
    }

    // Process the logo if it exists (expecting data URL like `data:image/png;base64,...`)
    let logoBuffer: Buffer | null = null;
    if (typeof cmp_logo === 'string' && cmp_logo.includes(',')) {
      const base64Data = cmp_logo.split(',')[1];
      if (base64Data) {
        logoBuffer = Buffer.from(base64Data, 'base64');
      }
    } else if (typeof cmp_logo === 'string' && cmp_logo.length > 0) {
      // if the client sent plain base64 without data URL prefix
      try {
        logoBuffer = Buffer.from(cmp_logo, 'base64');
      } catch {
        // ignore invalid base64, leave logoBuffer null
      }
    }

    const query = `
      UPDATE posdb.company SET
        cmp_name = $2,
        add1 = $3,
        add2 = $4,
        country_code = $5,
        state_code = $6,
        city_code = $7,
        pin = $8,
        phone = $9,
        email = $10,
        contact_person = $11,
        contact_phone = $12,
        contact_mail = $13,
        blocked = $14,
        vat_regn_no = $15,
        tan_no = $16,
        gstin = $17,
        arn_no = $18,
        tcan_no = $19,
        cmp_logo = $20,
        pan_no = $21
      WHERE cmp_code = $1
      RETURNING cmp_code
    `;

    const values = [
      cmp_code,
      cmp_name ?? null,
      add1 ?? null,
      add2 ?? null,
      country_code ?? null,
      state_code ?? null,
      city_code ?? null,
      pin ?? null,
      phone ?? null,
      email ?? null,
      contact_person ?? null,
      contact_phone ?? null,
      contact_mail ?? null,
      blocked ?? null,
      vat_regn_no ?? null,
      tan_no ?? null,
      gstin ?? null,
      arn_no ?? null,
      tcan_no ?? null,
      logoBuffer,
      pan_no ?? null,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Invalidate caches
    try {
      await redis.del('companies:all');
      await redis.del(`company:${cmp_code}`);
    } catch (cacheErr) {
      console.warn('Failed to invalidate redis cache after company update:', cacheErr);
      // Not fatal for the update operation
    }

    return res.status(200).json({ message: 'Company updated successfully' });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Failed to update company:', err);
    return res.status(500).json({
      message: 'Failed to Update Company',
      error: err.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
