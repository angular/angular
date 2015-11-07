library angular2.src.router.route_config_normalizer;

import "route_config_decorator.dart";
import "package:angular2/src/facade/exceptions.dart" show BaseException;

RouteDefinition normalizeRouteConfig(RouteDefinition config) {
  return config;
}

void assertComponentExists(Type component, String path) {
  if (component == null) {
    throw new BaseException(
        'Component for route "${path}" is not defined, or is not a class.');
  }
}
