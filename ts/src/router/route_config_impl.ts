import {CONST, Type, isPresent} from 'angular2/src/facade/lang';
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
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
 * - `useAsDefault` is a boolean value. If `true`, the child route will be navigated to if no child
 * route is specified during the navigation.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/home', component: HomeCmp, name: 'HomeCmp' }
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class Route implements RouteDefinition {
  data: {[key: string]: any};
  path: string;
  component: Type;
  name: string;
  useAsDefault: boolean;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  aux: string = null;
  loader: Function = null;
  redirectTo: any[] = null;
  constructor({path, component, name, data, useAsDefault}: {
    path: string,
    component: Type, name?: string, data?: {[key: string]: any}, useAsDefault?: boolean
  }) {
    this.path = path;
    this.component = component;
    this.name = name;
    this.data = data;
    this.useAsDefault = useAsDefault;
  }
}

/**
 * `AuxRoute` is a type of {@link RouteDefinition} used to define an auxiliary route.
 *
 * It takes an object with the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
 *
 * ### Example
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
  data: {[key: string]: any} = null;
  path: string;
  component: Type;
  name: string;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  aux: string = null;
  loader: Function = null;
  redirectTo: any[] = null;
  useAsDefault: boolean = false;
  constructor({path, component, name}: {path: string, component: Type, name?: string}) {
    this.path = path;
    this.component = component;
    this.name = name;
  }
}

/**
 * `AsyncRoute` is a type of {@link RouteDefinition} used to route a path to an asynchronously
 * loaded component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `loader` is a function that returns a promise that resolves to a component.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
 * - `useAsDefault` is a boolean value. If `true`, the child route will be navigated to if no child
 * route is specified during the navigation.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/home', loader: () => Promise.resolve(MyLoadedCmp), name: 'MyLoadedCmp'}
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class AsyncRoute implements RouteDefinition {
  data: {[key: string]: any};
  path: string;
  loader: Function;
  name: string;
  useAsDefault: boolean;
  aux: string = null;
  constructor({path, loader, name, data, useAsDefault}: {
    path: string,
    loader: Function, name?: string, data?: {[key: string]: any}, useAsDefault?: boolean
  }) {
    this.path = path;
    this.loader = loader;
    this.name = name;
    this.data = data;
    this.useAsDefault = useAsDefault;
  }
}

/**
 * `Redirect` is a type of {@link RouteDefinition} used to route a path to a canonical route.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `redirectTo` is an array representing the link DSL.
 *
 * Note that redirects **do not** affect how links are generated. For that, see the `useAsDefault`
 * option.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/', redirectTo: ['/Home'] },
 *   {path: '/home', component: HomeCmp, name: 'Home'}
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class Redirect implements RouteDefinition {
  path: string;
  redirectTo: any[];
  name: string = null;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  loader: Function = null;
  data: any = null;
  aux: string = null;
  useAsDefault: boolean = false;
  constructor({path, redirectTo}: {path: string, redirectTo: any[]}) {
    this.path = path;
    this.redirectTo = redirectTo;
  }
}
