import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { appDataSource } from '@/db/typeorm.config';

@ValidatorConstraint({ name: 'ValidateEntity', async: true })
export class ValidateEntity implements ValidatorConstraintInterface {
  async validate(value: string, args: ValidationArguments) {
    const repository = args.constraints[0];
    const pathToProperty = args.constraints[1];
    const entity: unknown = await appDataSource
      .getRepository(repository)
      .findOne({
        where: {
          [pathToProperty ? pathToProperty : args.property]: pathToProperty
            ? value?.[pathToProperty]
            : value,
        },
      });

    return Boolean(entity);
  }

  defaultMessage() {
    return 'Entity not found';
  }
}
