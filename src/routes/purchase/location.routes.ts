import { Router } from 'express';
import { addLocation } from '../../controllers/purchase/location/addLocation.controller';
import { deleteLocation } from '../../controllers/purchase/location/deleteLocation.controller';
import { getLocationByCompany } from '../../controllers/purchase/location/getLocationByCompany.controller';
import { getLocationById } from '../../controllers/purchase/location/getLocationById.controller';
import { updateLocation } from '../../controllers/purchase/location/updateLocation.controller';

import { validate } from '../../middlewares/validate';
import { LocationFormSchema } from '../../schemas/purchase/location.schema';

const router = Router();


router.post("/addLocation", validate(LocationFormSchema), addLocation);
router.get('/getLocationById', getLocationById);
router.get('/getLocationByCompany/:id', getLocationByCompany);
router.put('/updateLocation', updateLocation);
router.post('/deleteLocation', deleteLocation);

export default router;
