import { Request, Response } from "express";
import { pool } from "../../../db";
import { redis } from "../../../db/redis";

export const getCitiesByState = async (req: Request, res: Response) => {
  try {
    const { state_code } = req.query;

    if (!state_code) {
      return res.status(400).json({ error: "Missing state_code" });
    }

    const cacheKey = `cities_by_state:${state_code}`;

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache hit: cities_by_state");
      return res.status(200).json(JSON.parse(cached));
    }

    console.log("Cache miss: cities_by_state");

    const result = await pool.query(
      `
      SELECT city_code, city_name, pin
      FROM posdb.city
      WHERE state_code = $1
      ORDER BY city_name ASC
      `,
      [state_code]
    );

    const cities = result.rows;

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(cities));

    return res.status(200).json(cities);

  } catch (error: any) {
    console.error("Error fetching cities:", error);
    return res.status(500).json({
      message: "Failed to fetch cities",
      error: error.message,
      status: "fail",
      timestamp: new Date().toLocaleString("en-IN"),
    });
  }
};
