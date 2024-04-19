import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request } from 'express';
import { createParamDecorator, HttpError } from 'routing-controllers';
import 'reflect-metadata';

export function Dto<T>(dto: T) {
  return createParamDecorator({
    required: true,
    async value(action, value) {
      const request = action.request as Request;
      const { body } = request;

      if (!body || !Object.values(body).length) {
        const error = new HttpError(400, 'Invalid request body');
        throw error;
      }

      const classObject = plainToInstance(dto as unknown as any, body);
      const errors = (await validate(classObject)) as ValidationError[];

      if (errors.length) {
        const [error] = errors;
        const message = error.constraints
          ? Object.values(error.constraints)[0]
          : 'Invalid request body';
        const httpError = new HttpError(400, message);
        throw httpError;
      }

      return dto ? { ...body, ...value } : value;
    },
  });
}
