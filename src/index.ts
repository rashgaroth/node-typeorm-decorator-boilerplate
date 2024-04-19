import 'dotenv/config';
import 'reflect-metadata';

import { initDataSource } from '@/db/typeorm.config';

import app from './configs/express.config';
import logger from './configs/logger.config';

const PORT = process.env.PORT || 5000;

const connect = async () => {
  try {
    logger.info('Starting the server...');
    await initDataSource();
    app.listen(PORT, () => {
      logger.info(`Server running at ${PORT}`);
    });
  } catch (e) {
    logger.info(`The connection to database was failed with error: ${e}`);
  }
};

connect();
