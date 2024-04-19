import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

export type EntityValues<T> = QueryDeepPartialEntity<T>;

export interface IDeleteById {
  id: number;
}

export interface IDetailById {
  id: number;
}

export interface IBaseQueryParams {
  limit: number;
  page: number;
}

export interface IOverrideRequest {
  code: number;
  message: string;
  positive: string;
  negative: string;
}

export interface ICookie {
  key: string;
  value: string;
}

export interface IPagination {
  totalPages: number;
  previousPage: number | null;
  currentPage: number;
  nextPage: number | null;
  totalItems: number;
}

export type HtmlJson = {
  type: string;
  tagName: string;
  attributes: { key: string; value: string }[];
  children: HtmlJson[];
};

export type JwtAccountPayload = {
  name: string;
  id: string;
  _as: string;
  email: string;
};
