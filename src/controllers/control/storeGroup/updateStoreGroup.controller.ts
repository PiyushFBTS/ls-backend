import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const updateStoreGroup = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!pool) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const { cmp_code, cmp_name, ou_code, ou_name, sg_code, sg_name } = body;

    // Validate required fields
    if (!cmp_code || !cmp_name || !ou_code || !ou_name || !sg_code || !sg_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        status: 'fail',
      });
    }

    //  Get user info (from auth middleware / JWT)
    const currentUser = (req as any).user?.username || 'system';
    const currentTime = new Date();

    // Update record
    const query = `
      UPDATE posdb.store_group SET
        cmp_code = $1,
        cmp_name = $2,
        ou_code = $3,
        ou_name = $4,
        sg_name = $5,
        modified_by = $6,
        modified_on = $7
      WHERE sg_code = $8
      RETURNING sg_code
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      sg_name,
      currentUser,
      currentTime,
      sg_code,
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Store Group not found' });
    }

    //  Clear related Redis cache
    try {
      await redis.del('storeGroups:all');
      await redis.del(`storeGroup:${sg_code}`);
      await redis.del(`storeGroups:company:${cmp_code}`);
    } catch (cacheErr) {
      console.warn('⚠️ Failed to clear Redis cache for Store Group:', cacheErr);
    }

    //  Return success
    return res.status(200).json({
      message: 'Store Group updated successfully',
      status: 'success',
    });
  } catch (error: any) {
    console.error(' Failed to update Store Group:', error);
    return res.status(500).json({
      message: 'Failed to Update Store Group',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
