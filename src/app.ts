import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import companyRoutes from '../src/routes/control/company/company.routes';
import operatingUnitRoutes from '../src/routes/control/opertaingUnit/operatingUnit.route';
import storeGroupRoutes from '../src/routes/control/storeGroup/storeGroup.routes';
import storeRoutes from '../src/routes/control/store/store.routes';
import terminalRoutes from '../src/routes/control/terminal/terminal.routes';
import userRoutes from '../src/routes/user/user.routes';
import roleRoutes from '../src/routes/user/role.routes';
import authRoutes from '../src/routes/auth/auth.routes';
import moduleRoutes from '../src/routes/module/module.routes';
import permissionRoutes from '../src/routes/permissions/permission.route';
import controlDropDown from './routes/dropDown/control/controlDropDown.routes';
import addressDropDown from './routes/dropDown/address/addressDropDown.routes';
import commonDropDown from './routes/common/commonDropDown.routes';
import currencyMaster from './routes/item/currencyMaster.Routes';
import gstGroup from './routes/item/gstGroup.Routes';
import itemHierarchy from './routes/item/itemHierarchy.routes';
import item from './routes/item/item.routes';
import itemSales from './routes/item/itemSales.Routes';
import ItemUnitOfMeasure from './routes/item/itemUnitOfMeasure.Routes';
import ItemVariant from './routes/item/itemVariant.Routes';
import unitOfMeasure from './routes/item/unitOfMeasure.Routes';
import vat from './routes/item/vat.Routes';
import vendorMaster from './routes/vendor/vendorMaster.Routes';
import VendorAssesseeCode from './routes/vendor/VendorAssesseeCode.Routes';
import vendorContact from './routes/vendor/vendorContact.Routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Auth
app.use("/api/auth", authRoutes);

// Control routes
app.use('/api/company', companyRoutes);
app.use('/api/operatingUnit', operatingUnitRoutes);
app.use('/api/storeGroup', storeGroupRoutes);
app.use('/api/store', storeRoutes);
app.use("/api/terminal", terminalRoutes);

// user
app.use("/api/user", userRoutes);
app.use("/api/role", roleRoutes);

//module
app.use("/api/module", moduleRoutes)

//Permission
app.use("/api/permission", permissionRoutes)

//dropdown
app.use("/api/controlDropDown",controlDropDown)
app.use("/api/addressDropDown",addressDropDown)

//common
app.use("/api/commonDropDown",commonDropDown)

//Item
app.use("/api/currencyMaster",currencyMaster)
app.use("/api/gstGroup",gstGroup)
app.use("/api/itemHierarchy",itemHierarchy)
app.use("/api/item",item)
app.use("/api/itemSales",itemSales)
app.use("/api/itemUnitOfMeasure",ItemUnitOfMeasure)
app.use("/api/itemVariant",ItemVariant)
app.use("/api/unitOfMeasure",unitOfMeasure)
app.use("/api/vat",vat)

// vendor
app.use("/api/vendorMaster",vendorMaster)
app.use("/api/VendorAssesseeCode",VendorAssesseeCode)
app.use("/api/vendorContact",vendorContact)


app.get('/', (_, res) => res.send('Backend running 🚀'));

export default app;
