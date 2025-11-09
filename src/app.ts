import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import companyRoutes from '../src/routes/control/company/company.routes';
import operatingUnitRoutes from '../src/routes/control/opertaingUnit/operatingUnit.route';
import storeGroupRoutes from '../src/routes/control/storeGroup/storeGroup.routes';
import storeRoutes from '../src/routes/control/store/store.routes';
import terminalRoutes from '../src/routes/control/terminal/terminal.routes';
import authRoutes from '../src/routes/auth/auth.routes';

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

app.get('/', (_, res) => res.send('Backend running 🚀'));

export default app;
