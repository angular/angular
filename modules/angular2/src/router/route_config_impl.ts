import {CONST, Type} from 'angular2/src/core/facade/lang';
import {RouteDefinition} from './route_definition';
export {RouteDefinition} from './route_definition';

/**
 * You use the RouteConfig annotation to add routes to a component.
 *
 * Supported keys:
 * - `path` (required)
 * - `component`, `loader`,  `redirectTo` (requires exactly one of these)
 * - `as` (optional)
 * - `data` (optional)
 */
@CONST()
export class RouteConfig {
  constructor(public configs: RouteDefinition[]) {}
}


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
