import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getLocationByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Company code

    if (!id) {
      return res.status(400).json({ error: 'Company ID (cmp_code) is required' });
    }

    const cacheKey = `Locations:company:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    //  Fetch from database
    const result = await pool.query(
      'SELECT * FROM posdb.location WHERE location_code = $1 ORDER BY location_code ASC',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No Location found for this Company' });
    }

    const Locations = result.rows;

    // Cache the result (5 min TTL)
    await redis.setex(cacheKey, 300, JSON.stringify(Locations));

    //  Respond with data
    return res.status(200).json(Locations);
  } catch (error: any) {
    console.error(' Failed to fetch Location by Company:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Location',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
