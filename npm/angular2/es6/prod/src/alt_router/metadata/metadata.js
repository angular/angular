import { stringify } from "angular2/src/facade/lang";
export class RouteMetadata {
    get path() { }
    get component() { }
}
/* @ts2dart_const */
export class Route {
    constructor({ path, component } = {}) {
        this.path = path;
        this.component = component;
    }
    toString() { return `@Route(${this.path}, ${stringify(this.component)})`; }
}
/* @ts2dart_const */
export class RoutesMetadata {
    constructor(routes) {
        this.routes = routes;
    }
    toString() { return `@Routes(${this.routes})`; }
}
