import { Router } from 'express';
import { addStoreGroup } from '../../../controllers/control/storeGroup/addStoreGroup.controller';
import { deleteStoreGroup } from '../../../controllers/control/storeGroup/deleteStoreGroup.controller';
import { getStoreGroupByCompany } from '../../../controllers/control/storeGroup/getStoreGroupByCompany.controller';
import { getStoreGroupById } from '../../../controllers/control/storeGroup/getStoreGroupById.controller';
import { updateStoreGroup } from '../../../controllers/control/storeGroup/updateStoreGroup.controller';
import { validate } from '../../../middlewares/validate';
import { StoreGroupSchema } from '../../../schemas/control/storeGroup/storeGroup.schema';

const router = Router();

// POST: Create Store Group
router.post('/addStoreGroup', validate(StoreGroupSchema), addStoreGroup);

// GET: Fetch all store groups for a company
router.get('/getStoreGroupByCompany/:id', getStoreGroupByCompany);

// POST: Delete Store Group(s)
router.post('/deleteStoreGroup', deleteStoreGroup);

// GET: Fetch  store groups for a specific ID
router.get('/getStoreGroupById', getStoreGroupById);

// PUT: Update Store Group
router.put('/updateStoreGroup/:id', updateStoreGroup);

export default router;
