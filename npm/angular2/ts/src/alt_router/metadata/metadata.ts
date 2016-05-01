import {Type, stringify} from "angular2/src/facade/lang";

export abstract class RouteMetadata {
  abstract get path(): string;
  abstract get component(): Type;
}

/* @ts2dart_const */
export class Route implements RouteMetadata {
  path: string;
  component: Type;
  constructor({path, component}: {path?: string, component?: Type} = {}) {
    this.path = path;
    this.component = component;
  }
  toString(): string { return `@Route(${this.path}, ${stringify(this.component)})`; }
}

/* @ts2dart_const */
export class RoutesMetadata {
  constructor(public routes: RouteMetadata[]) {}
  toString(): string { return `@Routes(${this.routes})`; }
}
