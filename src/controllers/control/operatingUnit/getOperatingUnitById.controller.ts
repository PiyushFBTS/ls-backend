import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getOperatingUnitById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Operating Unit ID is required' });
    }

    const cacheKey = `operatingUnit:${id}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache miss for ${cacheKey}`);

    //  Query the database
    const result = await pool.query('SELECT * FROM posdb.ou WHERE ou_code = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Operating Unit not found' });
    }

    const operatingUnit = result.rows[0];

    // Store in Redis (cache for 5 minutes)
    await redis.setex(cacheKey, 300, JSON.stringify(operatingUnit));

    //  Return result
    return res.status(200).json(operatingUnit);
  } catch (error: any) {
    console.error(' Failed to fetch Operating Unit by ID:', error);
    return res.status(500).json({
      message: 'Failed to Fetch Operating Unit',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
