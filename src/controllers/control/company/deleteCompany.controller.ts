import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate request
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    //  Check foreign key dependencies
    const userQuery = `
      SELECT user_code FROM posdb.users WHERE cmp_code = ANY($1::text[])
    `;
    const userResult = await pool.query(userQuery, [ids]);

    if (userResult.rows.length > 0) {
      return res.status(400).json({
        message:
          'Company cannot be deleted as it is associated with one or more Users',
      });
    }

    const storeQuery = `
      SELECT store_code FROM posdb.store WHERE cmp_code = ANY($1::text[])
    `;
    const storeResult = await pool.query(storeQuery, [ids]);

    if (storeResult.rows.length > 0) {
      return res.status(400).json({
        message:
          'Company cannot be deleted as it is associated with one or more Operating Units',
      });
    }

    // Delete companies
    const deleteQuery = `
      DELETE FROM posdb.company
      WHERE cmp_code = ANY($1::text[])
    `;
    const result = await pool.query(deleteQuery, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No companies deleted (not found)' });
    }

    //  Invalidate Redis cache
    try {
      await redis.del('companies:all');
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`company:${id}`));
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate cache after deletion:', cacheErr);
    }

    //  Success response
    return res.status(200).json({
      message: 'Company deleted successfully',
      deletedCount: result.rowCount,
    });
  } catch (error: any) {
    console.error(' Failed to delete company:', error);
    return res.status(500).json({
      message: 'Failed to Delete Company',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
