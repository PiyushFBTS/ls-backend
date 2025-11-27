import { Request, Response } from 'express';
import { pool } from '../../db';
import { redis } from '../../db/redis';

export const setUserPermissions = async (req: Request, res: Response) => {
  const { role_code, permissions, cmp_code, cmp_name } = req.body;

  // Basic validation
  if (!role_code || !Array.isArray(permissions) || !cmp_code || !cmp_name) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const perm of permissions) {
      const { module_code, can_read, can_add, can_update, can_delete } = perm;

      await client.query(
        `
        INSERT INTO posdb.role_module_permissions 
          (role_code, module_code, can_read, can_add, can_update, can_delete, cmp_code, cmp_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (role_code, module_code)
        DO UPDATE SET 
          can_read = EXCLUDED.can_read,
          can_add = EXCLUDED.can_add,
          can_update = EXCLUDED.can_update,
          can_delete = EXCLUDED.can_delete
        `,
        [
          role_code,
          module_code,
          can_read,
          can_add,
          can_update,
          can_delete,
          cmp_code,
          cmp_name,
        ]
      );
    }

    await client.query('COMMIT');

    //  OPTIONAL BUT RECOMMENDED:
    // Clear Redis cache for this role (if stored earlier)
    await redis.del(`user_permissions:${role_code}`);
    await redis.del(`role_permissions:${role_code}`);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Permission update error:', error);

    return res.status(500).json({
      error: 'Failed to set permissions',
      details: error.message,
      timestamp: new Date().toLocaleString('en-IN'),
    });
  } finally {
    client.release();
  }
};
