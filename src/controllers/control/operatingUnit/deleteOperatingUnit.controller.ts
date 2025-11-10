import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteOperatingUnit = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    //  Check for dependent stores
    const storeQuery = `
      SELECT store_code FROM posdb.store WHERE ou_code = ANY($1::integer[])
    `;
    const storeResult = await pool.query(storeQuery, [ids]);

    if (storeResult.rows.length > 0) {
      return res.status(400).json({
        message:
          'Operating Unit cannot be deleted as it is associated with one or more Store',
      });
    }

    // Delete operating units
    const deleteQuery = `
      DELETE FROM posdb.ou
      WHERE ou_code = ANY($1::integer[])
    `;
    const result = await pool.query(deleteQuery, [ids]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: 'No Operating Units deleted (not found)' });
    }

    //  Invalidate Redis caches
    try {
      await redis.del('operatingUnits:all');
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`operatingUnit:${id}`));
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate OU cache after delete:', cacheErr);
    }

    //  Respond success
    return res.status(200).json({
      message: 'Operating Unit deleted successfully',
      deletedCount: result.rowCount,
    });
  } catch (error: any) {
    console.error(' Failed to delete Operating Unit:', error);
    return res.status(500).json({
      message: 'Failed to Delete Operating Unit',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
