import { Type } from 'angular2/src/facade/lang';
import { RouteDefinition } from './route_definition';
export { RouteDefinition } from './route_definition';
/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
export declare class RouteConfig {
    configs: RouteDefinition[];
    constructor(configs: RouteDefinition[]);
}
/**
 * `Route` is a type of {@link RouteDefinition} used to route a path to a component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
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
export declare class Route implements RouteDefinition {
    data: {
        [key: string]: any;
    };
    path: string;
    component: Type;
    name: string;
    aux: string;
    loader: Function;
    redirectTo: string;
    constructor({path, component, name, data}: {
        path: string;
        component: Type;
        name?: string;
        data?: {
            [key: string]: any;
        };
    });
}
/**
 * `AuxRoute` is a type of {@link RouteDefinition} used to define an auxiliary route.
 *
 * It takes an object with the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `component` a component type.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
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
export declare class AuxRoute implements RouteDefinition {
    data: {
        [key: string]: any;
    };
    path: string;
    component: Type;
    name: string;
    aux: string;
    loader: Function;
    redirectTo: string;
    constructor({path, component, name}: {
        path: string;
        component: Type;
        name?: string;
    });
}
/**
 * `AsyncRoute` is a type of {@link RouteDefinition} used to route a path to an asynchronously
 * loaded component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `loader` is a function that returns a promise that resolves to a component.
 * - `name` is an optional `CamelCase` string representing the name of the route.
 * - `data` is an optional property of any type representing arbitrary route metadata for the given
 * route. It is injectable via {@link RouteData}.
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
export declare class AsyncRoute implements RouteDefinition {
    data: {
        [key: string]: any;
    };
    path: string;
    loader: Function;
    name: string;
    aux: string;
    constructor({path, loader, name, data}: {
        path: string;
        loader: Function;
        name?: string;
        data?: {
            [key: string]: any;
        };
    });
}
/**
 * `Redirect` is a type of {@link RouteDefinition} used to route a path to an asynchronously loaded
 * component.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `redirectTo` is a string representing the new URL to be matched against.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/', redirectTo: '/home'},
 *   {path: '/home', component: HomeCmp}
 * ])
 * class MyApp {}
 * ```
 */
export declare class Redirect implements RouteDefinition {
    path: string;
    redirectTo: string;
    name: string;
    loader: Function;
    data: any;
    aux: string;
    constructor({path, redirectTo}: {
        path: string;
        redirectTo: string;
    });
}
