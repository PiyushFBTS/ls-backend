import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';
import { StoreGroupFormValues } from '../../../schemas/control/storeGroup/storeGroup.schema';

export const addStoreGroup = async (req: Request, res: Response) => {
  try {
    const body = req.body as StoreGroupFormValues;

    if (!pool) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const { cmp_code, cmp_name, ou_code, ou_name, sg_code, sg_name } = body;

    // Basic validation
    if (!cmp_code || !cmp_name || !ou_code || !ou_name || !sg_code || !sg_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if store group already exists
    const checkQuery = `SELECT sg_code FROM posdb.store_group WHERE sg_code = $1`;
    const existing = await pool.query(checkQuery, [sg_code]);

    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ error: "Store Group with this ID already exists" });
    }

    // In a real app, replace with your auth middleware’s user context
    const currentUser = (req as any).user?.username || 'system';
    const currentTime = new Date();

    const query = `
      INSERT INTO posdb.store_group (
        cmp_code, cmp_name, ou_code, ou_name,
        sg_code, sg_name,
        created_by, created_on, modified_by, modified_on
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6,
        $7, $8, $9, $10
      )
    `;

    const values = [
      cmp_code,
      cmp_name,
      ou_code,
      ou_name,
      sg_code,
      sg_name,
      currentUser,
      currentTime,
      currentUser,
      currentTime,
    ];

    await pool.query(query, values);

    // Invalidate cache
    try {
      await redis.del('storeGroups:all');
      await redis.del(`storeGroups:company:${cmp_code}`);
      await redis.del(`storeGroups:ou:${ou_code}`);
    } catch (cacheErr) {
      console.warn(' Failed to invalidate Redis cache:', cacheErr);
    }

    return res
      .status(200)
      .json({ message: 'Store Group created successfully', status: 'success' });
  } catch (error: any) {
    console.error(' Failed to create Store Group:', error);
    return res.status(500).json({
      message: 'Failed to create Store Group',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
