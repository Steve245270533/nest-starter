import config from 'config';
import { z } from 'zod';

const AppConfigSchema = z.object({
  name: z.string(),
  logger: z.boolean(),
  cors: z.boolean(),
  prefix: z.string(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

const DBSchema = z.object({
  username: z.string(),
  password: z.string(),
  port: z.number(),
  host: z.string(),
});

export type DbConfig = z.infer<typeof DBSchema>;

export interface Configuration {
  app: AppConfig;
  db: DbConfig;
}

export default function configuration(): Configuration {
  const app = AppConfigSchema.parse(config.get<AppConfig>('app'));
  const db = DBSchema.parse(config.get<DbConfig>('db'));

  return {
    app,
    db,
  };
}
