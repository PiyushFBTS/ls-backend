import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getStoreGroupById = async (req: Request, res: Response) => {
  try {
    const { sg_code, cmp_code } = req.query;

    // Validate required query parameters
    if (!sg_code || !cmp_code) {
      return res.status(400).json({
        error: "Missing required query params: sg_code, cmp_code",
      });
    }

    const cacheKey = `storeGroup:${cmp_code}:${sg_code}`;

    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss: ${cacheKey}`);

    // Query database with composite key
    const query = `
      SELECT *
      FROM posdb.store_group
      WHERE sg_code = $1 
        AND cmp_code = $2
    `;

    const result = await pool.query(query, [sg_code, cmp_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store Group not found" });
    }

    const storeGroup = result.rows[0];

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(storeGroup));

    return res.status(200).json(storeGroup);

  } catch (error: any) {
    console.error("Failed to fetch Store Group:", error);

    return res.status(500).json({
      message: "Failed to Fetch Store Group",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
