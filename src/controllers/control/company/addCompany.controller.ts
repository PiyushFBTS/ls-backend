import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { CompanyFormValues } from '../../../schemas/control/company/company.schema';

export const createCompany = async (req: Request, res: Response) => {
  try {
    const body = req.body as CompanyFormValues;

    const {
      cmp_code,
      cmp_name,
      add1,
      add2,
      country_code,
      state_code,
      city_code,
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

    // verify city pin
    const pinResult = await pool.query(
      'SELECT pin FROM posdb.city WHERE city_code = $1 LIMIT 1',
      [city_code]
    );

    if (pinResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid Pin: City not found' });
    }

    const pin = pinResult.rows[0].pin;

    // process logo
    let logoBuffer: Buffer | null = null;
    if (cmp_logo) {
      const base64Data = cmp_logo.split(',')[1];
      logoBuffer = Buffer.from(base64Data, 'base64');
    }

    const insertQuery = `
      INSERT INTO posdb.company (
        cmp_code, cmp_name, add1, add2, country_code, state_code, city_code,
        pin, phone, email, contact_person, contact_phone, contact_mail, blocked,
        vat_regn_no, tan_no, gstin, arn_no, tcan_no, cmp_logo, pan_no
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21
      )
    `;

    const values = [
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
      logoBuffer,
      pan_no,
    ];

    await pool.query(insertQuery, values);

    return res.status(200).json({ message: 'Company added successfully' });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return res.status(500).json({
      message: 'Failed to create company',
      error: error.message,
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
