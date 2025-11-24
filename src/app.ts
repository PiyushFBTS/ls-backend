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




app.get('/', (_, res) => res.send('Backend running 🚀'));

export default app;
