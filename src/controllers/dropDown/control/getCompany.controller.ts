import { Request, Response } from 'express';
import { pool } from '../../../db';
import { redis } from '../../../db/redis';

export const getCompany = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'company:all';

    // Try Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit: company');
      return res.status(200).json(JSON.parse(cached));
    }

    console.log('Cache miss: company');

    const result = await pool.query(`
      SELECT cmp_code, cmp_name 
      FROM posdb.company
      ORDER BY cmp_name ASC
    `);

    const companies = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(companies));

    return res.status(200).json(companies);

  } catch (error: any) {
    console.error('Error fetching companies:', error);

    return res.status(500).json({
      message: 'Failed to fetch companies',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN')
    });
  }
};
