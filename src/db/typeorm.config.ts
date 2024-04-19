import { DataSource } from 'typeorm';
import 'dotenv/config';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nodejs-sample',
  port: parseInt(process.env.DB_PORT) || 3306,
  synchronize: false,
  entities: [`${__dirname}/../entities/**/*.entity{.ts,.js}`],
  logging: process.env.NODE_ENV !== 'production',
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
});

export const initDataSource = async () => {
  try {
    if (appDataSource?.isInitialized) return appDataSource;
    await appDataSource.initialize();
    return appDataSource;
  } catch (error) {
    throw new Error(`Error initializing DataSource: ${error}`);
  }
};
