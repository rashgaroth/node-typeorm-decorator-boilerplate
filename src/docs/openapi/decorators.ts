/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-types */
import { ValidationTypes } from 'class-validator';
import { targetConstructorToSchema } from 'class-validator-jsonschema';
import { isUndefined, negate, pickBy } from 'lodash';
import _merge from 'lodash.merge';
import { SchemaObject } from 'openapi3-ts/oas30';
import type { OperationObject } from 'openapi3-ts/oas31';
import { ParameterObject, ReferenceObject } from 'openapi3-ts/oas31';
import 'reflect-metadata';

import { getContentType, getStatusCode } from '@/docs/openapi/specs';

import { IRoute } from './index';

const OPEN_API_KEY = Symbol('OpenAPI');

export type OpenAPIParam =
  | Partial<OperationObject>
  | ((source: OperationObject, route: IRoute) => OperationObject);

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ClassLike<T> extends Function {
  new (...args: any[]): T;
}

/**
 * Supplement action with additional OpenAPI Operation keywords.
 *
 * @param spec OpenAPI Operation object that is merged into the schema derived
 * from routing-controllers decorators. In case of conflicts, keywords defined
 * here overwrite the existing ones. Alternatively you can supply a function
 * that receives as parameters the existing Operation and target route,
 * returning an updated Operation.
 */
export function OpenAPI(spec: OpenAPIParam) {
  // eslint-disable-next-line
  return (...args: [Function] | [object, string, PropertyDescriptor]) => {
    if (args.length === 1) {
      const [target] = args;
      const currentMeta = getOpenAPIMetadata(target);
      setOpenAPIMetadata([spec, ...currentMeta], target);
    } else {
      const [target, key] = args;
      const currentMeta = getOpenAPIMetadata(target, key);
      setOpenAPIMetadata([spec, ...currentMeta], target, key);
    }
  };
}

export function ApiProperty(
  opts?: { required: boolean; isArray: boolean } | undefined
) {
  return createPropertyDecorator('api:properties', opts || {});
}

export function createPropertyDecorator<T extends Record<string, any> = any>(
  metakey: string,
  metadata: T
): PropertyDecorator {
  return (target, propertyKey) => {
    const properties = Reflect.getMetadata(metakey, target.constructor) || [];

    const key = `:${propertyKey as string}`;
    if (!properties.includes(key)) {
      Reflect.defineMetadata(
        `api:properties:array`,
        [...properties, `:${propertyKey as string}`],
        target
      );
    }

    const existingMetadata = Reflect.getMetadata(
      metakey,
      target.constructor,
      propertyKey
    );

    if (existingMetadata) {
      const newMetadata = pickBy(metadata, negate(isUndefined));
      const metadataToSave = {
        ...newMetadata,
        ...existingMetadata,
      };

      Reflect.defineMetadata(
        metakey,
        metadataToSave,
        target.constructor,
        propertyKey
      );
    } else {
      const type =
        Reflect.getMetadata('design:type', target.constructor, propertyKey) ||
        {};

      Reflect.defineMetadata(
        metakey,
        {
          type,
          ...pickBy(metadata, negate(isUndefined)),
        },
        target.constructor,
        propertyKey
      );
    }
  };
}

export function AcceptFiles() {
  return OpenAPI({
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
                maximum: 5,
              },
            },
          },
        },
      },
    },
  });
}

export function UseBearer() {
  return OpenAPI({
    security: [{ bearerAuth: [] }],
  });
}

export function ApiDto<T>(
  dto: ClassLike<T> | string,
  opts?: OpenAPIParam | undefined
) {
  if (typeof dto !== 'string' && !dto?.name) {
    throw new Error('ApiDto requires a class with a name property');
  }

  const { defaultMetadataStorage } = require('class-transformer/cjs/storage');
  const schema = targetConstructorToSchema(dto as ClassLike<T>, {
    additionalConverters: {
      ValidateEntity: (meta) => {
        const [entity, property] = meta.constraints;
        return {
          type: 'object',
          description: `${entity || 'Unknown'} Entity`,
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: `${entity || 'Unknown'} ${property || 'id'}`,
              example: '<uuid>',
            },
          },
        };
      },
      [ValidationTypes.NESTED_VALIDATION]: (meta) => {
        return {
          type: 'object',
          description: `${meta.propertyName} Nested`,
        };
      },
    },
    classTransformerMetadataStorage: defaultMetadataStorage,
  });

  const obj = {
    requestBody: {
      content: {
        'application/json': {
          schema: schema as {
            [schema: string]: SchemaObject | ReferenceObject;
          },
        },
      },
    },
    ...(opts || {}),
  };
  return OpenAPI(obj);
}

export type PaginatedOptions = {
  additionalParameters?: (ParameterObject | ReferenceObject)[];
};

export function Populate() {
  return OpenAPI({
    parameters: [
      {
        name: 'populate',
        in: 'query',
        schema: {
          type: 'string',
          default: '',
        },
        required: false,
        description: 'Comma separated list of fields to populate',
        example: 'user.profile,category,comments.user',
      },
    ],
  });
}

export function Paginated(opts?: PaginatedOptions) {
  return OpenAPI({
    parameters: [
      {
        name: 'page',
        in: 'query',
        schema: {
          type: 'integer',
          default: 1,
        },
        required: false,
        example: 1,
      },
      {
        name: 'limit',
        in: 'query',
        schema: {
          type: 'integer',
          default: 10,
        },
        required: false,
        example: 10,
      },
      {
        name: 'populate',
        in: 'query',
        schema: {
          type: 'string',
          default: '',
        },
        required: false,
        description: 'Comma separated list of fields to populate',
        example: 'user.profile,category,comments.user',
      },
      {
        name: 'search',
        in: 'query',
        schema: {
          type: 'string',
          default: '',
        },
        required: false,
        description: 'Search query (Currently supports only one field)',
        example: 'name:John',
      },
      {
        name: 'order',
        in: 'query',
        schema: {
          type: 'string',
          default: '',
        },
        required: false,
        description: 'Order query',
        example: 'name:asc,age:desc',
      },
      ...(opts?.additionalParameters || []),
    ],
  });
}

/**
 * Apply the keywords defined in @OpenAPI decorator to its target route.
 */
export function applyOpenAPIDecorator(
  originalOperation: OperationObject,
  route: IRoute
): OperationObject {
  const { action } = route;
  const openAPIParams = [
    ...getOpenAPIMetadata(action.target),
    ...getOpenAPIMetadata(action.target.prototype, action.method),
  ];

  return openAPIParams.reduce((acc: OperationObject, oaParam: OpenAPIParam) => {
    return typeof oaParam === 'function'
      ? oaParam(acc, route)
      : _merge({}, acc, oaParam);
  }, originalOperation) as OperationObject;
}

/**
 * Get the OpenAPI Operation object stored in given target property's metadata.
 */
export function getOpenAPIMetadata(
  target: object,
  key?: string
): OpenAPIParam[] {
  return (
    (key
      ? Reflect.getMetadata(OPEN_API_KEY, target.constructor, key)
      : Reflect.getMetadata(OPEN_API_KEY, target)) || []
  );
}

/**
 * Store given OpenAPI Operation object into target property's metadata.
 */
export function setOpenAPIMetadata(
  value: OpenAPIParam[],
  target: object,
  key?: string
) {
  return key
    ? Reflect.defineMetadata(OPEN_API_KEY, value, target.constructor, key)
    : Reflect.defineMetadata(OPEN_API_KEY, value, target);
}

/**
 * Supplement action with response body type annotation.
 */
export function ResponseSchema(
  // eslint-disable-next-line @typescript-eslint/ban-types
  responseClass: Function | string,
  options: {
    contentType?: string;
    description?: string;
    statusCode?: string | number;
    isArray?: boolean;
  } = {}
) {
  const setResponseSchema = (source: OperationObject, route: IRoute) => {
    const contentType = options.contentType || getContentType(route);
    const description = options.description || '';
    const isArray = options.isArray || false;
    const statusCode = (options.statusCode || getStatusCode(route)) + '';

    let responseSchemaName = '';
    if (typeof responseClass === 'function' && responseClass.name) {
      responseSchemaName = responseClass.name;
    } else if (typeof responseClass === 'string') {
      responseSchemaName = responseClass;
    }

    if (responseSchemaName) {
      const reference = {
        $ref: `#/components/schemas/${responseSchemaName}`,
      };
      const schema = isArray ? { items: reference, type: 'array' } : reference;
      const responses = {
        [statusCode]: {
          content: {
            [contentType]: {
              schema,
            },
          },
          description,
        },
      };

      const oldSchema =
        source.responses[statusCode]?.content[contentType].schema;

      if (oldSchema?.$ref || oldSchema?.items || oldSchema?.oneOf) {
        // case where we're adding multiple schemas under single statuscode/contentType
        const newStatusCodeResponse = _merge(
          {},
          source.responses[statusCode],
          responses[statusCode]
        );
        const newSchema = oldSchema.oneOf
          ? {
              oneOf: [...oldSchema.oneOf, schema],
            }
          : { oneOf: [oldSchema, schema] };

        newStatusCodeResponse.content[contentType].schema = newSchema;
        source.responses[statusCode] = newStatusCodeResponse;
        return source;
      }

      return _merge({}, source, { responses });
    }

    return source;
  };

  return OpenAPI(setResponseSchema);
}
