import {CONST, Type} from 'angular2/src/core/facade/lang';
import {RouteDefinition} from './route_definition';
export {RouteDefinition} from './route_definition';

/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
@CONST()
export class RouteConfig {
  constructor(public configs: RouteDefinition[]) {}
}

/**
 * `Route` is a type of {@link RouteDefinition} used to route a path to a component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `as` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via the {@link ROUTE_DATA} token.
 *
 * ## Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/home', component: HomeCmp, as: 'HomeCmp' }
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class Route implements RouteDefinition {
  data: any;
  path: string;
  component: Type;
  as: string;
  // added next two properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  loader: Function;
  redirectTo: string;
  constructor({path, component, as, data}:
                  {path: string, component: Type, as?: string, data?: any}) {
    this.path = path;
    this.component = component;
    this.as = as;
    this.loader = null;
    this.redirectTo = null;
    this.data = data;
  }
}

/**
 * `AuxRoute` is a type of {@link RouteDefinition} used to define an auxiliary route.
 *
 * It takes an object with the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `as` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via the {@link ROUTE_DATA} token.
 *
 * ## Example
 * ```
 * import {RouteConfig, AuxRoute} from 'angular2/router';
 *
 * @RouteConfig([
 *   new AuxRoute({path: '/home', component: HomeCmp})
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class AuxRoute implements RouteDefinition {
  data: any = null;
  path: string;
  component: Type;
  as: string;
  // added next two properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  loader: Function = null;
  redirectTo: string = null;
  constructor({path, component, as}: {path: string, component: Type, as?: string}) {
    this.path = path;
    this.component = component;
    this.as = as;
  }
}

/**
 * `AsyncRoute` is a type of {@link RouteDefinition} used to route a path to an asynchronously
 * loaded component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `loader` is a function that returns a promise that resolves to a component.
 * - `as` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via the {@link ROUTE_DATA} token.
 *
 * ## Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/home', loader: () => Promise.resolve(MyLoadedCmp), as: 'MyLoadedCmp'}
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class AsyncRoute implements RouteDefinition {
  data: any;
  path: string;
  loader: Function;
  as: string;
  constructor({path, loader, as, data}: {path: string, loader: Function, as?: string, data?: any}) {
    this.path = path;
    this.loader = loader;
    this.as = as;
    this.data = data;
  }
}

/**
 * `Redirect` is a type of {@link RouteDefinition} used to route a path to an asynchronously loaded
 * component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `redirectTo` is a string representing the new URL to be matched against.
 *
 * ## Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/', redirectTo: '/home'},
 *   {path: '/home', component: HomeCmp}
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class Redirect implements RouteDefinition {
  path: string;
  redirectTo: string;
  as: string = null;
  // added next property to work around https://github.com/Microsoft/TypeScript/issues/4107
  loader: Function = null;
  data: any = null;
  constructor({path, redirectTo}: {path: string, redirectTo: string}) {
    this.path = path;
    this.redirectTo = redirectTo;
  }
}
