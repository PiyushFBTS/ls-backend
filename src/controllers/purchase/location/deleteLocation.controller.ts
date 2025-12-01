import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // Validate request
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    //  Check foreign key dependencies
    const userQuery = `
      SELECT location_code FROM posdb.purchase_line WHERE location_code = ANY($1::text[])
    `;
    const purchaseHeader = await pool.query(userQuery, [ids]);

    if (purchaseHeader.rows.length > 0) {
      return res.status(400).json({
        message:
          'Location cannot be deleted as it is associated with one or more Users',
      });
    }

    const purchaseLineQuery = `
      SELECT location_code FROM posdb.purchase_line WHERE location_code = ANY($1::text[])
    `;
    const storeResult = await pool.query(purchaseLineQuery, [ids]);

    if (storeResult.rows.length > 0) {
      return res.status(400).json({
        message:
          'Location cannot be deleted as it is associated with one or more purchase Lines',
      });
    }

    // Delete companies
    const deleteQuery = `
      DELETE FROM posdb.Location
      WHERE location_code = ANY($1::text[])
    `;
    const result = await pool.query(deleteQuery, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No location deleted (not found)' });
    }

    //  Invalidate Redis cache
    try {
      await redis.del('locations:all');
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`location:${id}`));
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn(' Failed to invalidate cache after deletion:', cacheErr);
    }

    //  Success response
    return res.status(200).json({
      message: 'Location deleted successfully',
      deletedCount: result.rowCount,
    });
  } catch (error: any) {
    console.error(' Failed to delete Location:', error);
    return res.status(500).json({
      message: 'Failed to Delete Location',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
