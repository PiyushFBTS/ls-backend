import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const updateOperatingUnit = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!pool) {
      return res
        .status(500)
        .json({ error: 'Database connection not available' });
    }

    const { cmp_code, cmp_name, ou_code, ou_name } = body;

    if (!cmp_code || !cmp_name || !ou_code || !ou_name) {
      return res
        .status(400)
        .json({ error: 'Missing required fields', status: 'fail' });
    }

    //  Replace with actual user from JWT/session middleware later
    const currentUser = (req as any).user?.username || 'system';
    const currentTime = new Date();

    // Check if company exists
    const cmpQuery = `SELECT cmp_code, cmp_name FROM posdb.company WHERE cmp_code = $1`;
    const cmpResult = await pool.query(cmpQuery, [cmp_code]);

    if (cmpResult.rowCount === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    //  Update Operating Unit
    const query = `
      UPDATE posdb.ou SET
        cmp_code = $1,
        cmp_name = $2,
        ou_name = $4,
        modified_by = $5,
        modified_on = $6
      WHERE ou_code = $3
      RETURNING ou_code
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      currentUser,
      currentTime,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Operating Unit not found' });
    }

    // Invalidate Redis cache (list + by-company + by-id)
    try {
      await redis.del('operatingUnits:all');
      await redis.del(`operatingUnit:${ou_code}`);
      await redis.del(`operatingUnits:company:${cmp_code}`);
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate Redis cache after OU update:', cacheErr);
    }

    //  Respond success
    return res.status(200).json({
      message: 'Operating Unit updated successfully',
      status: 'success',
    });
  } catch (error: any) {
    console.error(' Failed to update Operating Unit:', error);
    return res.status(500).json({
      message: 'Failed to Update Operating Unit',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
