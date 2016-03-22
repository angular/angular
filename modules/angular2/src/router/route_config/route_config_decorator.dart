library angular2.router.route_config_decorator;

import './route_config_impl.dart';
export './route_config_impl.dart';

/**
 * Use [Routes] instead.
 *
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of [RouteDefinition]s.
 */
@deprecated
class RouteConfig extends Routes {
  const RouteConfig(List<RouteDefinition> configs) : super(configs);
}
