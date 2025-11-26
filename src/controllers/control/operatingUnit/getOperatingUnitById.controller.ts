import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const getOperatingUnitById = async (req: Request, res: Response) => {
  try {
    const { ou_code, cmp_code } = req.query;

    // Validate required params
    if (!ou_code || !cmp_code) {
      return res.status(400).json({
        error: "Missing required query params: ou_code, cmp_code",
      });
    }

    const cacheKey = `operatingUnit:${cmp_code}:${ou_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }


    // Query DB
    const query = `
      SELECT *
      FROM posdb.ou
      WHERE ou_code = $1 AND cmp_code = $2
    `;

    const result = await pool.query(query, [ou_code, cmp_code]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Operating Unit not found",
      });
    }

    const ou = result.rows[0];

    // Cache for 5 mins
    await redis.setex(cacheKey, 300, JSON.stringify(ou));

    return res.status(200).json(ou);

  } catch (error: any) {
    console.error("Failed to fetch Operating Unit:", error);

    return res.status(500).json({
      message: "Failed to Fetch Operating Unit",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
