import { Request, Response } from 'express';
import { pool } from '../../../db';
import { redis } from '../../../db/redis';

export const getStoreByOu = async (req: Request, res: Response) => {
  try {
    const { ou_code } = req.query;

    if (!ou_code) {
      return res.status(400).json({ error: 'Missing ou_code' });
    }

    const cacheKey = `store_by_ou:${ou_code}`;

    // Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `
      SELECT 
        cmp_code,
        cmp_name,
        ou_code,
        ou_name,
        store_code,
        store_name
      FROM posdb.store
      WHERE ou_code = $1
      `,
      [ou_code]
    );

    const data = result.rows;

    // Cache result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Error fetching Stores:', error);
    return res.status(500).json({
      message: 'Failed to fetch Stores',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
