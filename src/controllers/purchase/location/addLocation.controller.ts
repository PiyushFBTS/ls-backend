import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis/index';

export const addLocation = async (req: Request, res: Response) => {
    try {
        const { location_code, name, address1, county, state, city, post_code, phone, gst, cmp_name, cmp_code } = req.body;

        // Basic validation (you can replace with Zod later)
        if (!location_code || !name || !address1 || !county || !state || !city || !post_code || !phone || !gst || !cmp_name || !cmp_code) {
            return res
                .status(400)
                .json({ error: 'Missing required fields', status: 'fail' });
        }
        // Check if location already exists
        const checkQuery = `SELECT location_code FROM posdb.location WHERE location_code = $1`;
        const existing = await pool.query(checkQuery, [location_code]);

        if ((existing.rowCount ?? 0) > 0) {
            return res.status(400).json({ error: "LOCation with this ID already exists" });
        }


        const query = `
      INSERT INTO posdb.location (
        location_code,
        name,
        address1,
        county,
        state,
        city,
        post_code,
        phone,
        gst,
        cmp_name,
        cmp_code
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10, $11
      )
    `;

        const values = [
            location_code, name, address1, county, state, city, post_code, phone, gst , cmp_name, cmp_code
        ];

        await pool.query(query, values);

        try {
            await redis.del('location:all');
            await redis.del(`location:purchase:${location_code}`);
        } catch (cacheErr) {
            console.warn(' Failed to invalidate location cache:', cacheErr);
        }

        return res.status(200).json({
            message: 'Location created successfully',
            status: 'success',
        });
    } catch (error: any) {
        console.error(' Failed to create Location:', error);
        return res.status(500).json({
            message: 'Failed to create Location',
            error: error.message,
            status: 'fail',
            timestamp: new Date().toLocaleString('en-IN'),
        });
    }
};
