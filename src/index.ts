import express, { Router } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { seed } from './data/seeds.js';
import { AdminController } from './controllers/admin.js';
import { UserController } from './controllers/user.js';
import { AnalyticsController } from './controllers/analytics.js';
import { ReminderController } from './controllers/reminder.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

seed();

// Instantiate controllers
const adminController = new AdminController();
const userController = new UserController();
const analyticsController = new AnalyticsController();
const reminderController = new ReminderController();

// Create routers
const adminRouter = Router();
const userRouter = Router();
const analyticsRouter = Router();
const reminderRouter = Router();

// Health route
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Admin routes
adminRouter.post('/alerts', adminController.createAlert.bind(adminController));
adminRouter.put('/alerts/:id', adminController.updateAlert.bind(adminController));
adminRouter.get('/alerts', adminController.listAlerts.bind(adminController));
adminRouter.get('/seeds', adminController.getSeeds.bind(adminController));

// User routes
userRouter.get('/alerts', userController.getUserAlerts.bind(userController));
userRouter.post('/alerts/:id/read-state', userController.setAlertReadState.bind(userController));
userRouter.post('/alerts/:id/snooze', userController.snoozeAlert.bind(userController));

// Analytics routes
analyticsRouter.get('/summary', analyticsController.getSummary.bind(analyticsController));

// Reminder routes
reminderRouter.post('/run', reminderController.runReminders.bind(reminderController));

// Mount routers
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/analytics', analyticsRouter);
app.use('/reminder', reminderRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Alerting platform API listening on http://localhost:${PORT}`);
});
