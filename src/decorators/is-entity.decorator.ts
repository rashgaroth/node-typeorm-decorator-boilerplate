/* eslint-disable @typescript-eslint/ban-types */
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsEntity(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEntity',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value) {
          return typeof value !== 'string' && value?.id;
        },
      },
    });
  };
}
