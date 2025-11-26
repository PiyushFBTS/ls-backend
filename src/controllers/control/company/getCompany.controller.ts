import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis/index';

//  Fetch all companies (with Redis caching)
export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'companies:all';

    // Try to get cached data
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM posdb.company ORDER BY cmp_name ASC'
    );

    const companies = result.rows;

    // Store in Redis for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(companies));

    return res.status(200).json(companies);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Company',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
