/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */

export {Router, RootRouter} from './src/router/router';
export {RouterOutlet} from './src/router/router_outlet';
export {RouterLink} from './src/router/router_link';
export {RouteParams} from './src/router/instruction';
export {RouteRegistry} from './src/router/route_registry';
export {LocationStrategy} from './src/router/location_strategy';
export {HashLocationStrategy} from './src/router/hash_location_strategy';
export {PathLocationStrategy} from './src/router/path_location_strategy';
export {Location, APP_BASE_HREF} from './src/router/location';
export * from './src/router/route_config_decorator';
export * from './src/router/route_definition';
export {OnActivate, OnDeactivate, OnReuse, CanDeactivate, CanReuse} from './src/router/interfaces';
export {CanActivate} from './src/router/lifecycle_annotations';
export {Instruction, ComponentInstruction} from './src/router/instruction';
export {Url} from './src/router/url_parser';
export {OpaqueToken} from 'angular2/angular2';
export {ROUTE_DATA} from './src/router/route_data';

import {LocationStrategy} from './src/router/location_strategy';
import {PathLocationStrategy} from './src/router/path_location_strategy';
import {Router, RootRouter} from './src/router/router';
import {RouterOutlet} from './src/router/router_outlet';
import {RouterLink} from './src/router/router_link';
import {RouteRegistry} from './src/router/route_registry';
import {Location} from './src/router/location';
import {bind, OpaqueToken, Binding} from './core';
import {CONST_EXPR, Type} from './src/core/facade/lang';

export const ROUTER_PRIMARY_COMPONENT: OpaqueToken =
    CONST_EXPR(new OpaqueToken('RouterPrimaryComponent'));

export const ROUTER_DIRECTIVES: any[] = CONST_EXPR([RouterOutlet, RouterLink]);

/**
 * A list of {@link Binding}. To use the router, you must add this to your application.
 *
 * ## Example
 *
 * ```typescript
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  new Route(...),
 * ])
 * class AppCmp {
 *  constructor(router: Router, location: Location) {
 *    // ...
 *  }
 *
 * }
 *
 *
 * bootstrap(AppCmp, [routerBindings(AppCmp)]);
 * ```
 */
export const ROUTER_BINDINGS: any[] = CONST_EXPR([
  RouteRegistry,
  CONST_EXPR(new Binding(LocationStrategy, {toClass: PathLocationStrategy})),
  Location,
  CONST_EXPR(
      new Binding(Router,
                  {
                    toFactory: routerFactory,
                    deps: CONST_EXPR([RouteRegistry, Location, ROUTER_PRIMARY_COMPONENT])
                  }))
]);

function routerFactory(registry, location, primaryComponent) {
  return new RootRouter(registry, location, primaryComponent);
}

export function routerBindings(primaryComponent: Type): Array<any> {
  return [ROUTER_BINDINGS, bind(ROUTER_PRIMARY_COMPONENT).toValue(primaryComponent)];
}
