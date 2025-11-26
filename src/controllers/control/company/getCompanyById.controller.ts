import { Request, Response } from 'express';
import { pool } from '../../../db/index';
import { redis } from '../../../db/redis/index';

const COMPANY_CACHE_TTL_SECONDS = 300; // 5 minutes

function bufferToDataUrl(buffer: Buffer | null | undefined, mime = 'image/jpeg') {
    if (!buffer) return null;
    // If already a Buffer, convert to base64 data URL
    return `data:${mime};base64,${buffer.toString('base64')}`;
}

export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: 'Company id is required' });
        }

        const cacheKey = `company:${id}`;

        // 1) Try cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            const cachedObj = JSON.parse(cached);
            return res.status(200).json(cachedObj);
        }

        // 2) Query DB
        const result = await pool.query('SELECT * FROM posdb.company WHERE cmp_code = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const company = { ...result.rows[0] } as Record<string, any>;

        // 3) Convert logo Buffer -> data URL (if required)
        if (company.cmp_logo) {
            // If the DB returns a Buffer (bytea)
            if (Buffer.isBuffer(company.cmp_logo)) {
                // Ideally you store mime type separately. Assuming jpeg if unknown.
                company.cmp_logo = bufferToDataUrl(company.cmp_logo, 'image/jpeg');
            } else if (typeof company.cmp_logo === 'string') {
                // If the DB has already stored a base64 string or data URL, attempt to normalize:
                if (!company.cmp_logo.startsWith('data:')) {
                    // assume it's base64 without data url prefix
                    company.cmp_logo = `data:image/jpeg;base64,${company.cmp_logo}`;
                }
            }
        }

        // 4) Cache the result (stringify)
        try {
            await redis.setex(cacheKey, COMPANY_CACHE_TTL_SECONDS, JSON.stringify(company));
        } catch (cacheErr) {
            console.warn('Failed to cache company:', cacheErr);
        }

        return res.status(200).json(company);
    } catch (error: any) {
        console.error('Error fetching company by id:', error);
        return res.status(500).json({
            message: 'Failed to Fetch Company',
            error: error?.message ?? String(error),
            status: 'fail',
            timestamp: new Date().toLocaleString('en-IN'),
        });
    }
};
