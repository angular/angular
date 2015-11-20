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
class Route implements RouteDefinition {
  final Map<String, dynamic> data;
  final String path;
  final Type component;
  final String name;
  final bool useAsDefault;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  final String aux = null;
  final Function loader = null;
  final List<dynamic> redirectTo = null;
  const Route({path, component, name, data, useAsDefault})
      : path = path,
        component = component,
        name = name,
        data = data,
        useAsDefault = useAsDefault;
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
  final List<dynamic> redirectTo = null;
  final bool useAsDefault = false;
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
class AsyncRoute implements RouteDefinition {
  final Map<String, dynamic> data;
  final String path;
  final Function loader;
  final String name;
  final bool useAsDefault;
  final String aux = null;
  const AsyncRoute({path, loader, name, data, useAsDefault})
      : path = path,
        loader = loader,
        name = name,
        data = data,
        useAsDefault = useAsDefault;
}

/**
 * `Redirect` is a type of [RouteDefinition] used to route a path to a canonical route.
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
class Redirect implements RouteDefinition {
  final String path;
  final List<dynamic> redirectTo;
  final String name = null;
  // added next three properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  final Function loader = null;
  final dynamic data = null;
  final String aux = null;
  final bool useAsDefault = false;
  const Redirect({path, redirectTo})
      : path = path,
        redirectTo = redirectTo;
}
