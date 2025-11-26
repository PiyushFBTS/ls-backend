import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { store_code, cmp_code } = req.query;

    // Validate required query params
    if (!store_code || !cmp_code) {
      return res.status(400).json({
        error: 'Missing query params: store_code, cmp_code',
      });
    }

    const cacheKey = `store:${cmp_code}:${store_code}`;

    // 🔹 Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss for ${cacheKey}`);

    // 🔹 Database query using composite key
    const query = `
      SELECT *
      FROM posdb.store
      WHERE store_code = $1
        AND cmp_code = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [store_code, cmp_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = result.rows[0];

    // 🔹 Cache result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(store));

    return res.status(200).json(store);
  } catch (error: any) {
    console.error('Failed to fetch store by ID:', error);
    return res.status(500).json({
      message: 'Failed to fetch Store',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
