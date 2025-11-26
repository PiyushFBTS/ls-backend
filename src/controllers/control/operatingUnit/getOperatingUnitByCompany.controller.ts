import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getOperatingUnitByCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Company code

    if (!id) {
      return res.status(400).json({ error: 'Company ID (cmp_code) is required' });
    }

    const cacheKey = `operatingUnits:company:${id}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    //  Fetch from database
    const result = await pool.query(
      'SELECT * FROM posdb.ou WHERE cmp_code = $1 ORDER BY ou_name ASC',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No Operating Units found for this Company' });
    }

    const operatingUnits = result.rows;

    // Cache the result (5 min TTL)
    await redis.setex(cacheKey, 300, JSON.stringify(operatingUnits));

    //  Respond with data
    return res.status(200).json(operatingUnits);
  } catch (error: any) {
    console.error(' Failed to fetch Operating Units by Company:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Operating Units',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
