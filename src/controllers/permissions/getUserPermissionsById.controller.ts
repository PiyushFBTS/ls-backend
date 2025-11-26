import { Request, Response } from 'express';
import { pool } from '../../db/index';
import { redis } from '../../db/redis/index';
import { PermissionItem } from '../../type/permission.type'


export const getUserPermissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const cacheKey = `user_permissions:${id}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const permissionsQuery = await pool.query(
            `
    SELECT  
        r.cmp_code, r.cmp_name, r.role_name, r.role_code,
        m.module_code, m.module_name,
        p.can_read, p.can_add, p.can_update, p.can_delete,
        u.user_code, u.user_name, u.user_full_name, u.user_email
    FROM posdb.role_module_permissions p 
    INNER JOIN posdb.user_roles r ON p.role_code = r.role_code 
    INNER JOIN posdb.modules m ON p.module_code = m.module_code
    INNER JOIN posdb.users u ON u.role_code = r.role_code
    WHERE p.role_code = $1
    ORDER BY m.module_code ASC;
    `,
            [id]
        );


        const rows = permissionsQuery.rows;

        // If there are NO role permissions → fallback to only user data
        if (!rows.length) {
            const userRes = await pool.query(
                `
         SELECT role_code, role_name, user_code, user_name, user_full_name,
                user_email, cmp_code, cmp_name
         FROM posdb.users 
         WHERE role_code = $1
        `,
                [id]
            );

            if (!userRes.rows.length) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = userRes.rows[0];

            const result = {
                cmp_code: user.cmp_code,
                cmp_name: user.cmp_name,
                user_code: user.user_code,
                user_name: user.user_name,
                user_full_name: user.user_full_name,
                user_email: user.user_email,
                role_name: null,
                role_code: null,
                Permission: {},
            };

            await redis.setex(cacheKey, 300, JSON.stringify(result));
            return res.status(200).json(result);
        }

        // Permissions exist → format the response
        const first = rows[0];

        const Permission: Record<string, PermissionItem> = {};

        rows.forEach((row) => {
            Permission[row.module_name] = {
                module_code: row.module_code,
                can_read: row.can_read,
                can_add: row.can_add,
                can_update: row.can_update,
                can_delete: row.can_delete,
            };
        });

        const result = {
            cmp_code: first.cmp_code,
            cmp_name: first.cmp_name,
            user_code: first.user_code,
            user_name: first.user_name,
            user_full_name: first.user_full_name,
            user_email: first.user_email,
            role_name: first.role_name,
            role_code: first.role_code,
            Permission,
        };

        // Cache for 5 minutes
        await redis.setex(cacheKey, 300, JSON.stringify(result));

        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error fetching user permissions:', error);
        return res.status(500).json({
            message: 'Failed to get User Permission',
            error: error.message,
            status: 'fail',
            timestamp: new Date().toLocaleString('en-IN'),
        });
    }
};
