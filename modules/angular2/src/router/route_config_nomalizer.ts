import {AsyncRoute, AuxRoute, Route, Redirect, RouteDefinition} from './route_config_decorator';
import {ComponentDefinition} from './route_definition';
import {Type, BaseException} from 'angular2/src/core/facade/lang';

/**
 * Given a JS Object that represents... returns a corresponding Route, AsyncRoute, or Redirect
 */
export function normalizeRouteConfig(config: RouteDefinition): RouteDefinition {
  if (config instanceof Route || config instanceof Redirect || config instanceof AsyncRoute ||
      config instanceof AuxRoute) {
    return <RouteDefinition>config;
  }

  if ((!config.component) == (!config.redirectTo)) {
    throw new BaseException(
        `Route config should contain exactly one "component", "loader", or "redirectTo" property.`);
  }
  if (config.component) {
    if (typeof config.component == 'object') {
      let componentDefinitionObject = <ComponentDefinition>config.component;
      if (componentDefinitionObject.type == 'constructor') {
        return new Route({
          path: config.path,
          component:<Type>componentDefinitionObject.constructor,
          as: config.as
        });
      } else if (componentDefinitionObject.type == 'loader') {
        return new AsyncRoute(
            {path: config.path, loader: componentDefinitionObject.loader, as: config.as});
      } else {
        throw new BaseException(
            `Invalid component type "${componentDefinitionObject.type}". Valid types are "constructor" and "loader".`);
      }
    }
    return new Route(<{
      path: string;
      component: Type;
      as?: string
    }>config);
  }

  if (config.redirectTo) {
    return new Redirect({path: config.path, redirectTo: config.redirectTo});
  }

  return config;
}
