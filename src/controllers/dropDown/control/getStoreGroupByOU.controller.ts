import { Request, Response } from 'express';
import { pool } from '../../../db';
import { redis } from '../../../db/redis';

export const getStoreGroupByOU = async (req: Request, res: Response) => {
  try {
    const { ou_code } = req.query;

    if (!ou_code) {
      return res.status(400).json({ error: 'Missing Operating Unit Code' });
    }

    const cacheKey = `store_group_by_ou:${ou_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit: store_group_by_ou');
      return res.status(200).json(JSON.parse(cached));
    }

    console.log('Cache miss: store_group_by_ou');

    const result = await pool.query(
      `
      SELECT 
        cmp_code,
        cmp_name,
        ou_code,
        ou_name,
        sg_code,
        sg_name
      FROM posdb.store_group
      WHERE ou_code = $1
      `,
      [ou_code]
    );

    const data = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Error fetching Store Groups:', error);
    return res.status(500).json({
      message: 'Failed to fetch Store Groups',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN')
    });
  }
};
