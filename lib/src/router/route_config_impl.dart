library angular2.src.router.route_config_impl;

import "package:angular2/src/facade/lang.dart" show Type, isPresent;
import "route_definition.dart" show RouteDefinition;
export "route_definition.dart" show RouteDefinition;

/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of [RouteDefinition]s.
 */
class RouteConfig {
  final List<RouteDefinition> configs;
  const RouteConfig(this.configs);
}

/**
 * `Route` is a type of [RouteDefinition] used to route a path to a component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via [RouteData].
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
class Route implements RouteDefinition {
  final Map<String, dynamic> data;
  final String path;
  final Type component;
  final String name;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  final String aux = null;
  final Function loader = null;
  final String redirectTo = null;
  const Route({path, component, name, data})
      : path = path,
        component = component,
        name = name,
        data = data;
}

/**
 * `AuxRoute` is a type of [RouteDefinition] used to define an auxiliary route.
 *
 * It takes an object with the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via [RouteData].
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
class AuxRoute implements RouteDefinition {
  final Map<String, dynamic> data = null;
  final String path;
  final Type component;
  final String name;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  final String aux = null;
  final Function loader = null;
  final String redirectTo = null;
  const AuxRoute({path, component, name})
      : path = path,
        component = component,
        name = name;
}

/**
 * `AsyncRoute` is a type of [RouteDefinition] used to route a path to an asynchronously
 * loaded component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `loader` is a function that returns a promise that resolves to a component.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via [RouteData].
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
class AsyncRoute implements RouteDefinition {
  final Map<String, dynamic> data;
  final String path;
  final Function loader;
  final String name;
  final String aux = null;
  const AsyncRoute({path, loader, name, data})
      : path = path,
        loader = loader,
        name = name,
        data = data;
}

/**
 * `Redirect` is a type of [RouteDefinition] used to route a path to an asynchronously loaded
 * component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `redirectTo` is a string representing the new URL to be matched against.
 *
 * ### Example
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
class Redirect implements RouteDefinition {
  final String path;
  final String redirectTo;
  final String name = null;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  final Function loader = null;
  final dynamic data = null;
  final String aux = null;
  const Redirect({path, redirectTo})
      : path = path,
        redirectTo = redirectTo;
}
