import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis';

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    // 1️⃣ Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }

    // 2️⃣ Check for dependent terminals
    const terminalQuery = `
      SELECT terminal_id 
      FROM posdb.terminal 
      WHERE store_code = ANY($1::text[])
    `;
    const terminalResult = await pool.query(terminalQuery, [ids]);

    if (terminalResult.rows.length > 0) {
      return res.status(400).json({
        message:
          'Store cannot be deleted as it is associated with one or more terminals',
      });
    }

    // 3️⃣ Delete the stores
    const deleteQuery = `
      DELETE FROM posdb.store
      WHERE store_code = ANY($1::text[])
    `;
    const result = await pool.query(deleteQuery, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No stores deleted (not found)' });
    }

    // 4️⃣ Invalidate related Redis cache
    try {
      await redis.del('stores:all');
      const pipeline = redis.pipeline();
      ids.forEach((id) => pipeline.del(`store:${id}`));
      await pipeline.exec();
    } catch (cacheErr) {
      console.warn('⚠️ Failed to invalidate Store cache after deletion:', cacheErr);
    }

    // 5️⃣ Success response
    return res.status(200).json({
      message: 'Store deleted successfully',
      deletedCount: result.rowCount,
    });
  } catch (error: any) {
    console.error('❌ Failed to delete Store:', error);
    return res.status(500).json({
      message: 'Failed to Delete Store',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
