import config from 'config';

export interface AppConfig {
  name: string;
  logger: boolean;
  cors: boolean;
  prefix: string;
}

export interface DbConfig {
  username?: string;
  password?: string;
  port?: number;
  host?: string;
}

export interface Configuration {
  app: AppConfig;
  db: DbConfig;
}

export default function configuration(): Configuration {
  return {
    app: config.get<AppConfig>('app'),
    db: config.get<DbConfig>('db'),
  };
}
