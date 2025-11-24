import { Request, Response } from 'express';
import { pool } from '../../../db';
import { redis } from '../../../db/redis';

export const getOperatingUnitByCmp = async (req: Request, res: Response) => {
  try {
    const { cmp_code } = req.query;

    if (!cmp_code) {
      return res.status(400).json({ error: 'Missing cmp_code' });
    }

    const cacheKey = `ou_by_company:${cmp_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit: ou_by_company');
      return res.status(200).json(JSON.parse(cached));
    }

    console.log('Cache miss: ou_by_company');

    const result = await pool.query(
      `SELECT cmp_code, cmp_name, ou_code, ou_name 
       FROM posdb.ou 
       WHERE cmp_code = $1`,
      [cmp_code]
    );

    const data = result.rows;

    // Cache result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(data));

    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Error fetching Operating Units:', error);
    return res.status(500).json({
      message: 'Failed to fetch Operating Units',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN')
    });
  }
};
