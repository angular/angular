/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */

export {Router} from './src/router/router';
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
export {OpaqueToken} from 'angular2/angular2';
export {ROUTE_DATA} from './src/router/route_data';

import {LocationStrategy} from './src/router/location_strategy';
import {PathLocationStrategy} from './src/router/path_location_strategy';
import {Router, RootRouter} from './src/router/router';
import {RouterOutlet, RouterOutlet_} from './src/router/router_outlet';
import {RouterLink} from './src/router/router_link';
import {RouteRegistry} from './src/router/route_registry';
import {Location} from './src/router/location';
import {bind, OpaqueToken, Binding} from './core';
import {CONST_EXPR, Type} from './src/core/facade/lang';

/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * You can use the {@link routerBindings} function in your {@link bootstrap} bindings to
 * simplify setting up these bindings.
 *
 * ## Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component, View} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_BINDINGS,
 *   ROUTER_PRIMARY_COMPONENT,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_BINDINGS,
 *   bind(ROUTER_PRIMARY_COMPONENT).toValue(AppCmp)
 * ]);
 * ```
 */
export const ROUTER_PRIMARY_COMPONENT: OpaqueToken =
    CONST_EXPR(new OpaqueToken('RouterPrimaryComponent'));

/**
 * A list of directives. To use the router directives like {@link RouterOutlet} and
 * {@link RouterLink}, add this to your `directives` array in the {@link View} decorator of your
 * component.
 *
 * ## Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component, View} from 'angular2/angular2';
 * import {ROUTER_DIRECTIVES, routerBindings, RouteConfig} from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *    // ...
 * }
 *
 * bootstrap(AppCmp, [routerBindings(AppCmp)]);
 * ```
 */
export const ROUTER_DIRECTIVES: any[] = CONST_EXPR([RouterOutlet, RouterLink]);

/**
 * A list of {@link Binding}s. To use the router, you must add this to your application.
 *
 * Note that you also need to bind to {@link ROUTER_PRIMARY_COMPONENT}.
 *
 * You can use the {@link routerBindings} function in your {@link bootstrap} bindings to
 * simplify setting up these bindings.
 *
 * ## Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component, View} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_BINDINGS,
 *   ROUTER_PRIMARY_COMPONENT,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_BINDINGS,
 *   bind(ROUTER_PRIMARY_COMPONENT).toValue(AppCmp)
 * ]);
 * ```
 */
export const ROUTER_BINDINGS: any[] = CONST_EXPR([
  RouteRegistry,
  CONST_EXPR(new Binding(LocationStrategy, {toClass: PathLocationStrategy})),
  Location,
  CONST_EXPR(new Binding(RouterOutlet, {toClass: RouterOutlet_})),
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

/**
 * A list of {@link Binding}s. To use the router, you must add these bindings to
 * your application.
 *
 * ## Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component, View} from 'angular2/angular2';
 * import {ROUTER_DIRECTIVES, routerBindings, RouteConfig} from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [routerBindings(AppCmp)]);
 * ```
 */
export function routerBindings(primaryComponent: Type): Array<any> {
  return [ROUTER_BINDINGS, bind(ROUTER_PRIMARY_COMPONENT).toValue(primaryComponent)];
}
