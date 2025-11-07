import { Router } from 'express';
import { createCompany } from '../../../controllers/control/company/addCompany.controller';
import { getAllCompanies } from '../../../controllers/control/company/getCompany.controller';
import { getCompanyById } from '../../../controllers/control/company/getCompanyById.controller';
import { updateCompany } from '../../../controllers/control/company/updateCompany.controller';
import { deleteCompany } from '../../../controllers/control/company/deleteCompany.controller';
import { validate } from '../../../middlewares/validate';
import { companyFormSchema } from '../../../schemas/control/company/company.schema';

const router = Router();

router.post('/addCompany', validate(companyFormSchema), createCompany);
router.get('/getCompany', getAllCompanies);
router.get('/getCompany/:id', getCompanyById);
router.put('/updateCompany', updateCompany);
router.put('/deleteCompany', deleteCompany);


export default router;
