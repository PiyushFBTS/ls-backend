import { Request, Response } from 'express';
import { pool } from '../../../db';
import { redis } from '../../../db/redis';

export const getStateByCountry = async (req: Request, res: Response) => {
  try {
    const { country_code } = req.query;

    if (!country_code) {
      return res.status(400).json({ error: 'Missing country_code' });
    }

    const cacheKey = `state_by_country:${country_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await pool.query(
      `
      SELECT state_code, state_name
      FROM posdb.state
      WHERE country_code = $1
      ORDER BY state_name ASC
      `,
      [country_code]
    );

    const states = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(states));

    return res.status(200).json(states);

  } catch (error: any) {
    console.error('Error fetching states:', error);

    return res.status(500).json({
      message: 'Failed to fetch states',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
