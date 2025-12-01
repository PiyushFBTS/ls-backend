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
import currencyMaster from './routes/item/currencyMaster.routes';
import gstGroup from './routes/item/gstGroup.routes';
import itemHierarchy from './routes/item/itemHierarchy.routes';
import item from './routes/item/item.routes';
import itemSales from './routes/item/itemSales.routes';
import ItemUnitOfMeasure from './routes/item/itemUnitOfMeasure.routes';
import ItemVariant from './routes/item/itemVariant.routes';
import unitOfMeasure from './routes/item/unitOfMeasure.routes';
import vat from './routes/item/vat.routes';
import vendorMaster from './routes/vendor/vendorMaster.routes';
import vendorAssesseeCode from './routes/vendor/vendorAssesseeCode.routes';
import vendorContact from './routes/vendor/vendorContact.routes';
import vendorPaymentTerms from './routes/vendor/vendorPaymentTerms.routes';
import vendorPriceList from './routes/vendor/vendorPriceList.routes';
import vendorSection from './routes/vendor/vendorSection.routes';
import pos from './routes/pos/pos.routes';

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
app.use("/api/VendorAssesseeCode",vendorAssesseeCode)
app.use("/api/vendorContact",vendorContact)
app.use("/api/vendorPaymentTerms",vendorPaymentTerms)
app.use("/api/vendorPriceList",vendorPriceList)
app.use("/api/vendorSection",vendorSection)

//pos
app.use("/api/pos",pos)

app.get('/', (_, res) => res.send('Backend running 🚀'));

export default app;
