/**
 * @module
 * @public
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */


export {Router} from './src/router/router';
export {RouterOutlet} from './src/router/router_outlet';
export {RouterLink} from './src/router/router_link';
export {RouteParams} from './src/router/instruction';
export * from './src/router/route_config_annotation';
export * from './src/router/route_config_decorator';

import {Router, RootRouter} from './src/router/router';
import {RouteRegistry} from './src/router/route_registry';
import {Pipeline} from './src/router/pipeline';
import {Location} from './src/router/location';
import {appComponentAnnotatedTypeToken} from './src/core/application_tokens';
import {bind} from './di';

export var routerInjectables:List = [
  RouteRegistry,
  Pipeline,
  Location,
  bind(Router).toFactory((registry, pipeline, location, meta) => {
    return new RootRouter(registry, pipeline, location, meta.type);
  }, [RouteRegistry, Pipeline, Location, appComponentAnnotatedTypeToken])
];
