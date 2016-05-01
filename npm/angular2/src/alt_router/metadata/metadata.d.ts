import { Type } from "angular2/src/facade/lang";
export declare abstract class RouteMetadata {
    path: string;
    component: Type;
}
export declare class Route implements RouteMetadata {
    path: string;
    component: Type;
    constructor({path, component}?: {
        path?: string;
        component?: Type;
    });
    toString(): string;
}
export declare class RoutesMetadata {
    routes: RouteMetadata[];
    constructor(routes: RouteMetadata[]);
    toString(): string;
}
