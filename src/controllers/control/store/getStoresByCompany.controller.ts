import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoresByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // company code

    // 1️⃣ Validate company ID
    if (!id) {
      return res.status(400).json({ error: 'Company ID (cmp_code) is required' });
    }

    const cacheKey = `stores:company:${id}`;

    // 2️⃣ Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss for ${cacheKey}`);

    // 3️⃣ Query the database
    const query = `
      SELECT *
      FROM posdb.store
      WHERE cmp_code = $1
      ORDER BY store_name ASC
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No stores found for this company' });
    }

    // 4️⃣ Cache result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(rows));

    // 5️⃣ Return response
    return res.status(200).json(rows);
  } catch (error: any) {
    console.error('❌ Failed to fetch stores by company:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Stores',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
