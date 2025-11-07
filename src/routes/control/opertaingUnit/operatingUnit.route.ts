import { Router } from 'express';
import { addOperatingUnit } from '../../../controllers/control/operatingUnit/addOperatingUnit.controller';
import { deleteOperatingUnit } from '../../../controllers/control/operatingUnit/deleteOperatingUnit.controller';
import { getOperatingUnitById } from '../../../controllers/control/operatingUnit/getOperatingUnitById.controller';
import { getOperatingUnitByCompany } from '../../../controllers/control/operatingUnit/getOperatingUnitByCompany.controller';
import { updateOperatingUnit } from '../../../controllers/control/operatingUnit/updateOperatingUnit.controller';

import { validate } from '../../../middlewares/validate';
import { operatingUnitSchema } from '../../../schemas/control/operatingUnit/operatingUnit.schema';

const router = Router();

router.post('/addOperatingUnit', validate(operatingUnitSchema), addOperatingUnit);
router.get('/getOperatingUnit/:id', getOperatingUnitById);
router.get('/getOperatingUnitByCompany/:id', getOperatingUnitByCompany);
router.put('/updateOperatingUnit', updateOperatingUnit);
router.post('/deleteOperatingUnit', deleteOperatingUnit);

export default router;
