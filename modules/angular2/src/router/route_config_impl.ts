import {CONST, Type} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';
import {isJsObject, isArray, makeTypeError} from 'angular2/src/facade/lang';
import {RouteDefinition} from './route_definition';
export {RouteDefinition} from './route_definition';

/**
 * You use the RouteConfig annotation to add routes to a component.
 *
 * Supported keys:
 * - `path` (required)
 * - `component`, `loader`,  `redirectTo` (requires exactly one of these)
 * - `as` (optional)
 */
@CONST()
export class RouteConfig {
  constructor(public configs: List<RouteDefinition>) {}
}


@CONST()
export class Route implements RouteDefinition {
  data: Object;
  path: string;
  component: Type;
  as: string;
  // added next two properties to work around https://github.com/Microsoft/TypeScript/issues/4107
  loader: Function;
  redirectTo: string;
  constructor({path, component, as, data = {}}:
                  {path: string, component: Type, as?: string, data?: Object}) {
    this.path = path;
    this.component = component;
    this.as = as;
    this.loader = null;
    this.redirectTo = null;
    if (isJsObject(data) && !isArray(data)) {
      this.data = data;
    } else {
      throw makeTypeError("RouteData for " + path + " must be an object.");
    }
  }
}



@CONST()
export class AuxRoute implements RouteDefinition {
  data: Object;
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

@CONST()
export class AsyncRoute implements RouteDefinition {
  data: Object;
  path: string;
  loader: Function;
  as: string;
  constructor({path, loader, as, data = {}}:
                  {path: string, loader: Function, as?: string, data?: Object}) {
    this.path = path;
    this.loader = loader;
    this.as = as;
    if (isJsObject(data) && !isArray(data)) {
      this.data = data;
    } else {
      throw makeTypeError("RouteData for " + path + " must be an object.");
    }
  }
}

@CONST()
export class Redirect implements RouteDefinition {
  data: Object;
  path: string;
  redirectTo: string;
  as: string = null;
  // added next property to work around https://github.com/Microsoft/TypeScript/issues/4107
  loader: Function = null;
  constructor({path, redirectTo}: {path: string, redirectTo: string}) {
    this.path = path;
    this.redirectTo = redirectTo;
  }
}
