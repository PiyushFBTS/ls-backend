import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoresByStoreGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // sg_code from URL

    // Validate sg_code
    if (!id) {
      return res.status(400).json({ error: 'Store Group Code (sg_code) is required' });
    }

    const cacheKey = `stores:storeGroup:${id}`;

    //  Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss for ${cacheKey}`);

    // Fetch stores by sg_code from DB
    const query = `
      SELECT *
      FROM posdb.store
      WHERE sg_code = $1
      ORDER BY store_name ASC
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No stores found for this Store Group' });
    }

    //  Cache result for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(rows));

    //  Send response
    return res.status(200).json(rows);
  } catch (error: any) {
    console.error(' Failed to fetch stores by store group:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Stores',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
