import { type Request, type Response } from 'express';
import { AlertService } from '../services/AlertService.js';
import { db } from '../data/store.js';
import { createAlertSchema, updateAlertSchema } from '../validation/alert-validation.js';

export class AdminController {
  private readonly alertService: AlertService;

  constructor() {
    this.alertService = new AlertService();
  }

  createAlert = (req: Request, res: Response) => {
    const parsed = createAlertSchema.safeParse(req.body);
    console.log('Parsed:', parsed);
    if (!parsed.success) return res.status(400).json(parsed.error.format());
    const alert = this.alertService.create(parsed.data);
    res.status(201).json(alert);
  };

  updateAlert = (req: Request, res: Response) => {
    const parsed = updateAlertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.format());
    const alert = this.alertService.update(req.params.id!, parsed.data);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  };

  listAlerts = (req: Request, res: Response) => {
    const { severity, status, audienceType } = req.query;
    const list = this.alertService.list({
      severity: severity as any,
      status: status as any,
      audienceType: audienceType as any,
    });
    res.json(list);
  };

  // Helper endpoint to view seed data (users & teams)
  getSeeds = (_req: Request, res: Response) => {
    res.json({ teams: db.teams, users: db.users });
  };
}
