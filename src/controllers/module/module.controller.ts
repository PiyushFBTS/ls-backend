import { Request, Response } from 'express';
import { pool } from '../../db/index';
import { redis } from '../../db/redis/index';

//  Fetch all modules (with Redis caching)
export const getAllModules = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'modules:all';

    // Try to get cached data
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `SELECT module_code, module_name 
       FROM posdb.modules 
       ORDER BY module_name ASC`
    );

    const modules = result.rows;

    // Store in Redis for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(modules));

    return res.status(200).json(modules);
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Modules',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
