import {AsyncRoute, AuxRoute, Route, Redirect, RouteDefinition} from './route_config_decorator';
import {ComponentDefinition} from './route_definition';
import {isType, Type} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';


/**
 * Given a JS Object that represents... returns a corresponding Route, AsyncRoute, or Redirect
 */
export function normalizeRouteConfig(config: RouteDefinition): RouteDefinition {
  if (config instanceof Route || config instanceof Redirect || config instanceof AsyncRoute ||
      config instanceof AuxRoute) {
    return <RouteDefinition>config;
  }

  if ((+!!config.component) + (+!!config.redirectTo) + (+!!config.loader) != 1) {
    throw new BaseException(
        `Route config should contain exactly one "component", "loader", or "redirectTo" property.`);
  }
  if (config.as && config.name) {
    throw new BaseException(`Route config should contain exactly one "as" or "name" property.`);
  }
  if (config.as) {
    config.name = config.as;
  }
  if (config.loader) {
    return new AsyncRoute({path: config.path, loader: config.loader, name: config.name});
  }
  if (config.aux) {
    return new AuxRoute({path: config.aux, component:<Type>config.component, name: config.name});
  }
  if (config.component) {
    if (typeof config.component == 'object') {
      let componentDefinitionObject = <ComponentDefinition>config.component;
      if (componentDefinitionObject.type == 'constructor') {
        return new Route({
          path: config.path,
          component:<Type>componentDefinitionObject.constructor,
          name: config.name
        });
      } else if (componentDefinitionObject.type == 'loader') {
        return new AsyncRoute(
            {path: config.path, loader: componentDefinitionObject.loader, name: config.name});
      } else {
        throw new BaseException(
            `Invalid component type "${componentDefinitionObject.type}". Valid types are "constructor" and "loader".`);
      }
    }
    return new Route(<{
      path: string;
      component: Type;
      name?: string;
    }>config);
  }

  if (config.redirectTo) {
    return new Redirect({path: config.path, redirectTo: config.redirectTo});
  }

  return config;
}

export function assertComponentExists(component: Type, path: string): void {
  if (!isType(component)) {
    throw new BaseException(`Component for route "${path}" is not defined, or is not a class.`);
  }
}
