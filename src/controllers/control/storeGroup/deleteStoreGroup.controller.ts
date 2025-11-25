import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteStoreGroup = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    // Validate input
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided' });
    }

    // Validate composite keys
    for (const rec of records) {
      if (!rec.cmp_code || !rec.sg_code) {
        return res.status(400).json({
          message: 'Each record must include cmp_code and sg_code',
        });
      }
    }

    const cmpCodes = records.map((r) => r.cmp_code);
    const sgCodes = records.map((r) => r.sg_code);

    // DELETE with composite key (cmp_code, sg_code)
    const deleteQuery = `
      DELETE FROM posdb.store_group
      WHERE (cmp_code, sg_code) IN (
        SELECT * FROM UNNEST($1::text[], $2::text[])
      )
    `;

    const result = await pool.query(deleteQuery, [cmpCodes, sgCodes]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'No Store Groups deleted (not found)',
      });
    }

    // Invalidate Redis caches
    try {
      await redis.del('storeGroups:all');

      const pipeline = redis.pipeline();
      records.forEach((r) =>
        pipeline.del(`storeGroup:${r.cmp_code}:${r.sg_code}`)
      );
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn('Failed to invalidate Store Group cache:', cacheErr);
    }

    return res.status(200).json({
      message: 'Store Group deleted successfully',
      deletedCount: result.rowCount,
      status: 'success',
    });

  } catch (error: any) {
    console.error('Failed to delete Store Group:', error);

    return res.status(500).json({
      message: 'Failed to delete Store Group',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
