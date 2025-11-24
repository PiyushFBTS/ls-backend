import { Request, Response } from 'express';
import { pool } from '../../../db';
import { redis } from '../../../db/redis';

export const getAllCountry = async (req: Request, res: Response) => {
  try {
    const cacheKey = 'country:all';

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('Cache hit: country:all');
      return res.status(200).json(JSON.parse(cached));
    }

    console.log('Cache miss: country:all');

    const result = await pool.query(
      `SELECT country_code, country_name 
       FROM posdb.country 
       ORDER BY country_name ASC`
    );

    const countries = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(countries));

    return res.status(200).json(countries);

  } catch (error: any) {
    console.error('Error fetching countries:', error);

    return res.status(500).json({
      message: 'Failed to fetch countries',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
