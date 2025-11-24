import express from 'express';
import { getOperatingUnitByCmp } from '../../../controllers/dropDown/control/getOperatingUnitByCmp.controller';
import { getStoreGroupByOU } from '../../../controllers/dropDown/control/getStoreGroupByOU.controller';
import { getStoreByOu } from '../../../controllers/dropDown/control/getStoreByOu.controller';
const router = express.Router();
import { getCompany } from '../../../controllers/dropDown/control/getCompany.controller';


router.get('/company/all', getCompany);
router.get('/ou', getOperatingUnitByCmp);
router.get('/store-group', getStoreGroupByOU);
router.get('/store', getStoreByOu);



export default router;
