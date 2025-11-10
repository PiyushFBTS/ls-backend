import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoreGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Store Group ID (sg_code) is required' });
    }

    const cacheKey = `storeGroup:${id}`;

    // Try to get from Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss for ${cacheKey}`);

    //  Query the database
    const result = await pool.query('SELECT * FROM posdb.store_group WHERE sg_code = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Store Group not found' });
    }

    const storeGroup = result.rows[0];

    // Cache the result (5-minute TTL)
    await redis.setex(cacheKey, 300, JSON.stringify(storeGroup));

    //  Return result
    return res.status(200).json(storeGroup);
  } catch (error: any) {
    console.error(' Failed to fetch Store Group by ID:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Store Group',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
