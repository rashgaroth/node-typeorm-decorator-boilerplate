import { Request } from 'express';

import { IPagination } from '@/interfaces/common.interface';

export default class ApiUtility {
  static getCookieFromRequest(req: Request, key: string) {
    if (req?.headers?.authorization) {
      return req?.headers?.authorization;
    }

    if (req.headers.cookie) {
      const results = req.headers.cookie.split(';');
      const filtered = results.filter((result: string) => {
        return result.startsWith(`${key}=`);
      });

      if (filtered.length > 0) {
        return filtered[0].split('=')[1];
      }
    }

    return null;
  }

  static getQueryParam(req: Request, type: string) {
    if (req && type && type !== '') {
      switch (type) {
        case 'limit': {
          return req.query.limit ? parseInt(req.query.limit.toString(), 10) : 5;
        }
        case 'page': {
          return req.query.page ? parseInt(req.query.page.toString(), 10) : 1;
        }
        default: {
          return req.query[type] ? req.query[type] : null;
        }
      }
    }
    return null;
  }

  static getOffset(limit: number, page: number) {
    return limit * page - limit;
  }

  static paginate(total: number, limit: number, currentPage: number) {
    if (total) {
      const pagination: IPagination = {
        currentPage,
        totalPages: Math.ceil(total / limit),
        previousPage: currentPage <= 1 ? null : currentPage - 1,
        nextPage: total - currentPage * limit > 0 ? currentPage + 1 : null,
        totalItems: total,
      };
      return { pagination };
    }
    return {
      pagination: {
        currentPage: 0,
        totalPages: 0,
        previousPage: null,
        nextPage: null,
        totalItems: 0,
      },
    };
  }
}
