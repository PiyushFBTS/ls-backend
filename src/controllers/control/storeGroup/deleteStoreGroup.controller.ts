import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteStoreGroup = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate request
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    //  Delete store groups
    const deleteQuery = `
      DELETE FROM posdb.store_group
      WHERE sg_code = ANY($1::text[])
    `;
    const result = await pool.query(deleteQuery, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No Store Groups deleted (not found)' });
    }

    // Invalidate Redis caches
    try {
      await redis.del('storeGroups:all');
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`storeGroup:${id}`));
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate Store Group cache:', cacheErr);
    }

    //  Return success
    return res.status(200).json({
      message: 'Store Group deleted successfully',
      deletedCount: result.rowCount,
    });
  } catch (error: any) {
    console.error(' Failed to delete Store Group:', error);
    return res.status(500).json({
      message: 'Failed to delete Store Group',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
