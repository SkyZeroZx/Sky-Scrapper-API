import { formatInTimeZone } from 'date-fns-tz';
import * as bcrypt from 'bcryptjs';

export function formatLocalDate(date: Date | string): string {
  return formatInTimeZone(date, process.env.TZ, 'yyyy-MM-dd HH:mm');
}

export function generateHashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
