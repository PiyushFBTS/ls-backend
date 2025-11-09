import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // store_code

    // 1️⃣ Validate ID
    if (!id) {
      return res.status(400).json({ error: 'Store ID (store_code) is required' });
    }

    const cacheKey = `store:${id}`;

    // 2️⃣ Try to get from Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss for ${cacheKey}`);

    // 3️⃣ Fetch from database
    const query = `
      SELECT *
      FROM posdb.store
      WHERE store_code = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = result.rows[0];

    // 4️⃣ Cache the store result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(store));

    // 5️⃣ Return result
    return res.status(200).json(store);
  } catch (error: any) {
    console.error('❌ Failed to fetch store by ID:', error);
    return res.status(500).json({
      message: 'Failed to fetch Store',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
