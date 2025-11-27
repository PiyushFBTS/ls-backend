import express from 'express';
import { getOperatingUnitByCmp } from '../../../controllers/dropDown/control/getOperatingUnitByCmp.controller';
import { getStoreGroupByOU } from '../../../controllers/dropDown/control/getStoreGroupByOU.controller';
import { getStoreByOu } from '../../../controllers/dropDown/control/getStoreByOu.controller';
const router = express.Router();
import { getCompany } from '../../../controllers/dropDown/control/getCompany.controller';


router.get('/getCompany', getCompany);
router.get('/getOperatingUnitByCmp', getOperatingUnitByCmp);
router.get('/getStoreGroupByOU', getStoreGroupByOU);
router.get('/getStoreByOu', getStoreByOu);



export default router;
