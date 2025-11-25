import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteOperatingUnit = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;

    // Validate input structure
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'No records provided' });
    }

    // Validate required composite keys
    for (const rec of records) {
      if (!rec.cmp_code || !rec.ou_code) {
        return res.status(400).json({
          message: 'Each record must include cmp_code and ou_code',
        });
      }
    }

    const cmpCodes = records.map((r) => r.cmp_code);
    const ouCodes = records.map((r) => r.ou_code);

    // Check for dependent stores
    const storeQuery = `
      SELECT store_code 
      FROM posdb.store 
      WHERE ou_code = ANY($1::integer[])
    `;
    const storeResult = await pool.query(storeQuery, [ouCodes]);

    if (storeResult.rows.length > 0) {
      return res.status(400).json({
        message:
          'Operating Unit cannot be deleted because it is associated with one or more Store.',
      });
    }

    // Delete using composite key (cmp_code, ou_code)
    const deleteQuery = `
      DELETE FROM posdb.ou
      WHERE (cmp_code, ou_code) IN (
        SELECT * FROM UNNEST($1::text[], $2::int[])
      )
    `;

    const deleteResult = await pool.query(deleteQuery, [cmpCodes, ouCodes]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        message: 'No Operating Units deleted (not found)',
      });
    }

    // Clear Redis cache
    try {
      await redis.del('operatingUnits:all');

      const pipeline = redis.pipeline();
      records.forEach((r) => {
        pipeline.del(`operatingUnit:${r.cmp_code}:${r.ou_code}`);
      });
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn('Failed to invalidate OU cache:', cacheErr);
    }

    // Success response
    return res.status(200).json({
      message: 'Operating Unit deleted successfully',
      deletedCount: deleteResult.rowCount,
      status: 'success',
    });

  } catch (error: any) {
    console.error('Failed to delete Operating Unit:', error);

    return res.status(500).json({
      message: 'Failed to Delete Operating Unit',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
