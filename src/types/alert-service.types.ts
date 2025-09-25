import type { AudienceScope, Severity } from '../domain/models.js';

export interface CreateAlertInput {
  title: string;
  message: string;
  severity: Severity;
  audience: AudienceScope;
  reminderFrequencyMinutes?: number | undefined;
  startAt?: Date | undefined;
  expiresAt?: Date | undefined;
  remindersEnabled?: boolean | undefined;
}

export interface UpdateAlertInput {
  title?: string | undefined;
  message?: string | undefined;
  severity?: Severity | undefined;
  audience?: AudienceScope | undefined;
  reminderFrequencyMinutes?: number | undefined;
  startAt?: Date | undefined;
  expiresAt?: Date | undefined;
  remindersEnabled?: boolean | undefined;
  isArchived?: boolean | undefined;
}
