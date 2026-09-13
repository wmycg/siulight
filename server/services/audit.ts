import { run } from '../db/client';
export const audit = (actor: string, action: string) =>
  run('INSERT INTO audit_logs (actor,action) VALUES (?,?)', [actor, action]);
