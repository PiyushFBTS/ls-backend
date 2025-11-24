import express from 'express';
import { getAllCountry } from '../../../controllers/dropDown/address/getAllCountry.controller';
import { getStateByCountry } from '../../../controllers/dropDown/address/getStateByCountry.controller';
import { getCitiesByState } from '../../../controllers/dropDown/address/getCitiesByState.controller';

const router = express.Router();

router.get('/country/all', getAllCountry);

router.get('/state', getStateByCountry);

router.get("/city", getCitiesByState);
export default router;
