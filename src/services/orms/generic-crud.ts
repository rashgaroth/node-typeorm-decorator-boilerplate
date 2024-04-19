import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';

import { withTransaction } from '@/utilities/db.utility';

export type GenericServiceProps<R> = {
  name: string;
  repo: Repository<R>;
  createDto?: string;
  updateDto?: string;
};

export class GenericService<R> {
  repo: Repository<R>;

  constructor(props: { repo: Repository<R> }) {
    this.repo = props.repo;
  }

  getOne = async (opts: FindOneOptions<R>) => {
    return await this.repo.findOne(opts as FindOneOptions);
  };

  getMany = async (opts: FindManyOptions<R>) => {
    return await this.repo.findAndCount(opts as FindManyOptions);
  };

  save = async (data: DeepPartial<R>) => {
    return await withTransaction(this.repo)(async (manager) => {
      return await manager.save(data as DeepPartial<R>);
    });
  };

  delete = async (id: string) => {
    return await withTransaction(this.repo)(async (manager) => {
      return await manager.softDelete(id);
    });
  };
}
