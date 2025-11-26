import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoreGroupByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // company code

    if (!id) {
      return res.status(400).json({ error: 'Company ID (cmp_code) is required' });
    }

    const cacheKey = `storeGroups:company:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    //  Fetch from database
    const result = await pool.query(
      'SELECT * FROM posdb.store_group WHERE cmp_code = $1 ORDER BY sg_code ASC',
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No Store Groups found for this Company' });
    }

    const storeGroups = result.rows;

    // Cache the result (5 min TTL)
    await redis.setex(cacheKey, 300, JSON.stringify(storeGroups));

    //  Return response
    return res.status(200).json(storeGroups);
  } catch (error: any) {
    console.error(' Failed to fetch Store Groups by Company:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Store Group',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
