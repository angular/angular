import {CONST, Type, isPresent} from 'angular2/src/facade/lang';
import {RouteDefinition} from '../route_definition';
import {RegexSerializer} from '../rules/route_paths/regex_route_path';

export {RouteDefinition} from '../route_definition';

/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
@CONST()
export class RouteConfig {
  constructor(public configs: RouteDefinition[]) {}
}

@CONST()
export abstract class AbstractRoute implements RouteDefinition {
  name: string;
  useAsDefault: boolean;
  path: string;
  regex: string;
  serializer: RegexSerializer;
  data: {[key: string]: any};

  constructor({name, useAsDefault, path, regex, serializer, data}: RouteDefinition) {
    this.name = name;
    this.useAsDefault = useAsDefault;
    this.path = path;
    this.regex = regex;
    this.serializer = serializer;
    this.data = data;
  }
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
 * import {RouteConfig, Route} from 'angular2/router';
 *
 * @RouteConfig([
 *   new Route({path: '/home', component: HomeCmp, name: 'HomeCmp' })
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class Route extends AbstractRoute {
  component: any;
  aux: string = null;

  constructor({name, useAsDefault, path, regex, serializer, data, component}: RouteDefinition) {
    super({
      name: name,
      useAsDefault: useAsDefault,
      path: path,
      regex: regex,
      serializer: serializer,
      data: data
    });
    this.component = component;
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
export class AuxRoute extends AbstractRoute {
  component: any;

  constructor({name, useAsDefault, path, regex, serializer, data, component}: RouteDefinition) {
    super({
      name: name,
      useAsDefault: useAsDefault,
      path: path,
      regex: regex,
      serializer: serializer,
      data: data
    });
    this.component = component;
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
 * import {RouteConfig, AsyncRoute} from 'angular2/router';
 *
 * @RouteConfig([
 *   new AsyncRoute({path: '/home', loader: () => Promise.resolve(MyLoadedCmp), name:
 * 'MyLoadedCmp'})
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class AsyncRoute extends AbstractRoute {
  loader: Function;
  aux: string = null;

  constructor({name, useAsDefault, path, regex, serializer, data, loader}: RouteDefinition) {
    super({
      name: name,
      useAsDefault: useAsDefault,
      path: path,
      regex: regex,
      serializer: serializer,
      data: data
    });
    this.loader = loader;
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
 * import {RouteConfig, Route, Redirect} from 'angular2/router';
 *
 * @RouteConfig([
 *   new Redirect({path: '/', redirectTo: ['/Home'] }),
 *   new Route({path: '/home', component: HomeCmp, name: 'Home'})
 * ])
 * class MyApp {}
 * ```
 */
@CONST()
export class Redirect extends AbstractRoute {
  redirectTo: any[];

  constructor({name, useAsDefault, path, regex, serializer, data, redirectTo}: RouteDefinition) {
    super({
      name: name,
      useAsDefault: useAsDefault,
      path: path,
      regex: regex,
      serializer: serializer,
      data: data
    });
    this.redirectTo = redirectTo;
  }
}
