import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const addOperatingUnit = async (req: Request, res: Response) => {
  try {
    const { cmp_code, cmp_name, ou_code, ou_name } = req.body;

    // Basic validation (you can replace with Zod later)
    if (!cmp_code || !cmp_name || !ou_code || !ou_name) {
      return res
        .status(400)
        .json({ error: 'Missing required fields', status: 'fail' });
    }

    // Replace this with your auth middleware in the future (extract username from JWT)
    const currentUser = (req as any).user?.username || 'system';
    const currentTime = new Date();

    const query = `
      INSERT INTO posdb.ou (
        cmp_code,
        cmp_name,
        ou_code,
        ou_name,
        created_by,
        created_on,
        modified_by,
        modified_on
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8
      )
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      currentUser,
      currentTime,
      currentUser,
      currentTime,
    ];

    await pool.query(query, values);

    // Invalidate Redis cache (list + company-level caches)
    try {
      await redis.del('operatingUnits:all');
      await redis.del(`operatingUnits:company:${cmp_code}`);
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate OU cache:', cacheErr);
    }

    return res.status(200).json({
      message: 'Operating Unit created successfully',
      status: 'success',
    });
  } catch (error: any) {
    console.error('❌ Failed to create Operating Unit:', error);
    return res.status(500).json({
      message: 'Failed to create Operating Unit',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
