import { type Request, type Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService.js';

export class AnalyticsController {
  private readonly analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getSummary = (_req: Request, res: Response) => {
    res.json(this.analyticsService.getSummary());
  };
}
