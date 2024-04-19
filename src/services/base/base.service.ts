import { DataSource, EntityTarget, FindOneOptions } from 'typeorm';

import { appDataSource } from '@/db/typeorm.config';

export default class BaseService {
  public dataSource: DataSource;

  constructor() {
    this.dataSource = appDataSource;
  }

  public get transaction() {
    return this.dataSource.manager.transaction;
  }

  public get<T>(target: EntityTarget<T>, opts: FindOneOptions<T> = {}) {
    return this.dataSource.getRepository(target).findOne(opts);
  }

  public getAndCount<T>(target: EntityTarget<T>, opts: FindOneOptions<T> = {}) {
    return this.dataSource.getRepository(target).findAndCount(opts);
  }

  public getAll<T>(target: EntityTarget<T>, opts: FindOneOptions<T> = {}) {
    return this.dataSource.getRepository(target).find(opts);
  }
}
