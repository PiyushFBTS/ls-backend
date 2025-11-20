import { Router } from 'express';
import { addStore } from '../../../controllers/control/store/addStore.controller';
import { deleteStore } from '../../../controllers/control/store/deleteStore.controller';
import { getStoresByStoreGroup } from '../../../controllers/control/store/getStoresByStoreGroup.controller';
import { getStoresByCompany } from '../../../controllers/control/store/getStoresByCompany.controller';
import { getStoreById } from '../../../controllers/control/store/getStoreById.controller';
import { updateStore } from '../../../controllers/control/store/updateStore.controller';
import { validate } from '../../../middlewares/validate';
import { StoreFormSchema } from '../../../schemas/control/store/store.schema';

const router = Router();

// Add Store
router.post('/addStore', validate(StoreFormSchema), addStore);

// Get Stores by Store Group (URL param)
router.get('/getStoresByStoreGroup/:id', getStoresByStoreGroup);

// Get Stores by Company
router.get('/getStoresByCompany/:id', getStoresByCompany);

// Delete Store
router.post('/deleteStore', deleteStore);

// Get a single store by ID (store_code)
router.get('/getStore/:id', getStoreById);

// Update Store
router.put('/updateStore/:id', updateStore);

export default router;
