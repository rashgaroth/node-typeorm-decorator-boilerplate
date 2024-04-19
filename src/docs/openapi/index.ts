import _merge from 'lodash.merge';
import * as oa from 'openapi3-ts';
import {
  MetadataArgsStorage,
  RoutingControllersOptions,
} from 'routing-controllers';
import { ActionMetadataArgs } from 'routing-controllers/types/metadata/args/ActionMetadataArgs';
import { ControllerMetadataArgs } from 'routing-controllers/types/metadata/args/ControllerMetadataArgs';
import { ParamMetadataArgs } from 'routing-controllers/types/metadata/args/ParamMetadataArgs';
import { ResponseHandlerMetadataArgs } from 'routing-controllers/types/metadata/args/ResponseHandleMetadataArgs';

import { getSpec } from '@/docs/openapi/specs';

/**
 * All the context for a single route.
 */
export interface IRoute {
  readonly action: ActionMetadataArgs;
  readonly controller: ControllerMetadataArgs;
  readonly options: RoutingControllersOptions;
  readonly params: ParamMetadataArgs[];
  readonly responseHandlers: ResponseHandlerMetadataArgs[];
}

/**
 * Parse routing-controllers metadata into an IRoute objects array.
 */
export function parseRoutes(
  storage: MetadataArgsStorage,
  options: RoutingControllersOptions = {}
): IRoute[] {
  return storage.actions.map((action) => ({
    action,
    controller: storage.controllers.find(
      (c) => c.target === action.target
    ) as ControllerMetadataArgs,
    options,
    params: storage
      .filterParamsWithTargetAndMethod(action.target, action.method)
      .sort((a, b) => a.index - b.index),
    responseHandlers: storage.filterResponseHandlersWithTargetAndMethod(
      action.target,
      action.method
    ),
  }));
}

// openapi module
export function parseRoutingController(
  storage: MetadataArgsStorage,
  routingControllerOptions: RoutingControllersOptions,
  opts: Partial<oa.oas31.OpenAPIObject>
) {
  const routes = parseRoutes(storage, routingControllerOptions);
  const spec = getSpec(routes, opts?.components?.schemas || {});
  return _merge(spec, opts);
}
