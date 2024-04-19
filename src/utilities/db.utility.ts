import { EntityManager, Repository, ValueTransformer } from 'typeorm';

import ApiUtility from '@/utilities/api.utility';

export function withTransaction<T>(repository: Repository<T>) {
  return async <R>(
    callback: (repository: Repository<T>, manager: EntityManager) => Promise<R>
  ): Promise<R> => {
    return await repository.manager.transaction(
      async (transactionalEntityManager) => {
        const target = transactionalEntityManager.getRepository(
          repository.target
        );
        return await callback(target, transactionalEntityManager);
      }
    );
  };
}

export const entityTransformers: Record<'date' | 'bigint', ValueTransformer> = {
  date: {
    from: (date: string | null) => date && new Date(parseInt(date, 10)),
    to: (date?: Date) => date?.valueOf().toString(),
  },
  bigint: {
    from: (bigInt: string | null) => bigInt && parseInt(bigInt, 10),
    to: (bigInt?: number) => bigInt?.toString(),
  },
};

export const withPagination = async <T>(
  fn: () => Promise<T>,
  limit: number,
  offset: number
) => {
  const result = await Promise.resolve(fn());
  const data = result?.[0];
  const count = result?.[1];

  return {
    result: data,
    ...ApiUtility.paginate(count, limit, offset / limit + 1),
  };
};
