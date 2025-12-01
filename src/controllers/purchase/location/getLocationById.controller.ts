import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis/index';

const Location_CACHE_TTL_SECONDS = 300; // 5 minutes


export const getLocationById = async (req: Request, res: Response) => {
    try {
        const { location_code } = req.query;
        if (!location_code) {
            return res.status(400).json({ error: 'Location id is required' });
        }

        const cacheKey = `Location:${location_code}`;

        // 1) Try cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            const cachedObj = JSON.parse(cached);
            return res.status(200).json(cachedObj);
        }

        // 2) Query DB
        const result = await pool.query('SELECT * FROM posdb.location WHERE location_code = $1', [location_code]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const Location = { ...result.rows[0] } as Record<string, any>;


        // 3) Cache the result (stringify)
        try {
            await redis.setex(cacheKey, Location_CACHE_TTL_SECONDS, JSON.stringify(Location));
        } catch (cacheErr) {
            console.warn('Failed to cache Location:', cacheErr);
        }

        return res.status(200).json(Location);
    } catch (error: any) {
        console.error('Error fetching Location by id:', error);
        return res.status(500).json({
            message: 'Failed to Fetch Location',
            error: error?.message ?? String(error),
            status: 'fail',
            timestamp: new Date().toLocaleString('en-IN'),
        });
    }
};
