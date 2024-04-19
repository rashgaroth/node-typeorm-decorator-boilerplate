import bodyParser from 'body-parser';
import { useContainer } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import express, { Request } from 'express';
import morgan from 'morgan';
import { ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import path from 'path';
import {
  Action,
  getMetadataArgsStorage,
  RoutingControllersOptions,
  UnauthorizedError,
  useExpressServer,
} from 'routing-controllers';
import * as sui from 'swagger-ui-express';

import { AuthLib } from '@/lib/auth.lib';

import { parseRoutingController } from '@/docs/openapi/index';
import { AuthService } from '@/modules/auth/auth.service';

const corsOption = {
  origin: [],
  methods: 'GET,POST,HEAD,OPTIONS,PUT,PATCH,DELETE',
  credentials: true,
};

const getApp = (): express.Express => {
  const defaultApp = express();

  defaultApp.use(bodyParser.json());
  defaultApp.use(morgan('dev'));

  const opts = {
    controllers: [path.join(`${__dirname}/../modules/**/*.controller.ts`)],
    middlewares: [path.join(`${__dirname}/../middlewares/*.middleware.ts`)],
    defaultErrorHandler: false,
    cors: corsOption,
    validation: true,
    defaults: {
      nullResultCode: 400,
      undefinedResultCode: 204,
    },
    interceptors: [path.join(`${__dirname}/../interceptors/*.interceptor.ts`)],
    classTransformer: true,
    routePrefix: '/api',
    authorizationChecker: async (ctx: Action, roles: string[]) => {
      const req = ctx.request as Request;
      const token = req.headers['authorization'];
      if (!token || !token?.split(' ')[1]) {
        throw new UnauthorizedError(
          `You're not authorized to access this resource`
        );
      }
      const authLib = new AuthLib();
      const authService = new AuthService();

      const payload = authLib.decodeSessionToken(token.split(' ')[1]);

      req.user = payload;

      return await authService.validateUserRole(payload.id, roles);
    },
    currentUserChecker: async (ctx: Action) => {
      const req = ctx.request as Request;
      const token = req.headers['authorization'];
      if (!token || !token?.split(' ')[1]) {
        throw new UnauthorizedError(
          `You're not authorized to access this resource`
        );
      }
      const authLib = new AuthLib();
      const payload = authLib.decodeSessionToken(token.split(' ')[1]);
      req.user = payload;
      return payload;
    },
  } as RoutingControllersOptions;
  const _app = useExpressServer(defaultApp, opts);
  _app.use('/static/', express.static('public/files'));
  _app.use('/static/private/', express.static('public/assets'));

  useContainer(_app, { fallbackOnErrors: true });

  const storage = getMetadataArgsStorage();
  const dtoSchemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
    always: true,
  });

  const specs = parseRoutingController(storage, opts, {
    info: {
      title: 'Digivite API Documentation',
      version: '1.0.0',
      description: 'API Documentation for Digivite',
      contact: {
        email: `dwi@nvpdev.tech`,
        name: `Dwi`,
      },
    },
    components: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      schemas: dtoSchemas as {
        [schema: string]: SchemaObject | ReferenceObject;
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  });

  _app.use(
    '/docs',
    sui.serve,
    sui.setup(specs, {
      swaggerOptions: { persistAuthorization: true },
      explorer: true,
      customCss: `.swagger-ui .topbar { display: none }`,
      customCssUrl: '/static/private/swagger.css',
      customSiteTitle: 'Digivite API Documentation',
      isExplorer: true,
    })
  );

  return _app;
};

const app = getApp();
export default app;
