import { type Request, type Response } from 'express';
import dayjs from 'dayjs';
import { db } from '../data/store.js';
import { isAlertActiveNow } from '../domain/models.js';
import { AlertService } from '../services/AlertService.js';
import { PreferenceService } from '../services/PreferenceService.js';
import { requireUserSchema, readStateSchema } from '../validation/user-validation.js';

export class UserController {
  private readonly alertService: AlertService;
  private readonly prefService: PreferenceService;

  constructor() {
    this.alertService = new AlertService();
    this.prefService = new PreferenceService();
  }

  getUserAlerts = (req: Request, res: Response) => {
    const parse = requireUserSchema.safeParse(req.query);
    if (!parse.success) return res.status(400).json(parse.error.format());
    const { userId } = parse.data;
    const now = new Date();
    const alerts = db.alerts.filter((a) => isAlertActiveNow(a, now));
    const visible = alerts.filter((a) =>
      this.alertService.resolveAudienceUsers(a.audience).some((u) => u.id === userId),
    );

    const enriched = visible.map((a) => {
      const pref = db.userAlertPrefs.find((p) => p.alertId === a.id && p.userId === userId);
      const lastDeliveredAt = [...db.deliveries]
        .filter((d) => d.alertId === a.id && d.userId === userId)
        .sort((x, y) => y.deliveredAt.getTime() - x.deliveredAt.getTime())[0]?.deliveredAt;

      return {
        ...a,
        userState: {
          readState: pref?.readState ?? 'unread',
          snoozedToday: pref?.lastSnoozedAt ? dayjs(pref.lastSnoozedAt).isSame(now, 'day') : false,
          lastDeliveredAt,
        },
      };
    });
    res.json(enriched);
  };

  setAlertReadState = (req: Request, res: Response) => {
    const userParsed = requireUserSchema.safeParse(req.query);
    if (!userParsed.success) return res.status(400).json(userParsed.error.format());
    const bodyParsed = readStateSchema.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json(bodyParsed.error.format());
    const pref = this.prefService.setReadState(
      req.params.id!,
      userParsed.data.userId,
      bodyParsed.data.readState,
    );
    res.json(pref);
  };

  snoozeAlert = (req: Request, res: Response) => {
    const userParsed = requireUserSchema.safeParse(req.query);
    if (!userParsed.success) return res.status(400).json(userParsed.error.format());
    const pref = this.prefService.snoozeForToday(req.params.id!, userParsed.data.userId);
    res.json(pref);
  };
}
