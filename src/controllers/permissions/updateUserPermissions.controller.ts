import { Request, Response } from 'express';
import { pool } from '../../db';
import { redis } from '../../db/redis';
import { PermissionItem } from '../../type/permission.type';

export const updateUserPermission = async (req: Request, res: Response) => {
  try {
    let { user_code, role_code, Permission, cmp_code, cmp_name } = req.body;

    // Convert Permission {} → PermissionItem[]
    const permissions: PermissionItem[] = Permission
      ? (Object.values(Permission) as PermissionItem[])
      : [];

    // Validation
    if (!user_code || !role_code || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // ❗ Remove only by ROLE — not user
      await client.query(
        `DELETE FROM posdb.role_module_permissions WHERE role_code = $1`,
        [role_code]
      );

      // Insert updated permissions
      for (const perm of permissions) {
        const { module_code, can_read, can_add, can_update, can_delete } = perm;

        await client.query(
          `
          INSERT INTO posdb.role_module_permissions 
            (role_code, module_code, can_read, can_add, can_update, can_delete, cmp_code, cmp_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

      // Clear cache (uses user_code but DB does NOT)
      await redis.del(`user_permissions:${user_code}`);
      await redis.del(`user_session:${user_code}`);

      return res.status(200).json({ message: 'Permissions updated successfully' });

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);

      return res.status(500).json({
        error: 'Failed to update permissions',
        details: error.message,
      });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Controller error:', error);
    return res.status(500).json({
      message: 'Failed to update User Permission',
      error: error.message,
      status: 'fail',
      timestamp: new Date().toLocaleString('en-IN'),
    });
  }
};
