import { Request } from 'express';
import { createParamDecorator } from 'routing-controllers';
import { FindManyOptions, ILike } from 'typeorm';
import 'reflect-metadata';

export type PaginatedParamsOpts = {
  defaultSkip?: number;
  defaultTake?: number;
  useRawSearch?: boolean;
};

export function PaginationParams<T>(opts?: PaginatedParamsOpts) {
  return createParamDecorator({
    required: true,
    async value(action, value) {
      const request = action.request as Request;
      const { query } = request;

      const page = query.page
        ? parseInt(query.page as string)
        : opts?.defaultSkip || undefined;
      const limit = query.limit
        ? parseInt(query.limit as string)
        : opts?.defaultTake || undefined;
      const search = String(query.search || '');
      const populate = query.populate ? String(query.populate).split(',') : [];

      const getPaginatedObject = () => {
        let paginationObject = {
          skip: page && limit ? (page - 1) * limit : undefined,
          take: limit ? parseInt(String(limit)) : undefined,
        } as FindManyOptions;

        if (!page) {
          delete paginationObject.skip;
        }
        if (!limit) {
          delete paginationObject.take;
        }

        if (search !== '') {
          const [key, value] = search.split(':');
          paginationObject = {
            ...paginationObject,
            where: {
              [key]: opts?.useRawSearch ? value : ILike(`%${value}%`),
            },
          };
        }

        if (populate.length > 0) {
          paginationObject = {
            ...paginationObject,
            loadEagerRelations: false,
            relations: populate,
          };
        }

        return paginationObject;
      };

      return { ...(getPaginatedObject() as FindManyOptions<T>), ...value };
    },
  });
}
