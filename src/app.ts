import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import companyRoutes from '../src/routes/control/company/company.routes';
import operatingUnitRoutes from '../src/routes/control/opertaingUnit/operatingUnit.route';


const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/company', companyRoutes);
app.use('/api/operatingUnit', operatingUnitRoutes);

app.get('/', (_, res) => res.send('Backend running 🚀'));

export default app;
