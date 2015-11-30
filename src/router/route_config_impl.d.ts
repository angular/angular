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
 * - `useAsDefault` is a boolean value. If `true`, the child route will be navigated to if no child
 * route is specified during the navigation.
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
    useAsDefault: boolean;
    aux: string;
    loader: Function;
    redirectTo: any[];
    constructor({path, component, name, data, useAsDefault}: {
        path: string;
        component: Type;
        name?: string;
        data?: {
            [key: string]: any;
        };
        useAsDefault?: boolean;
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
    redirectTo: any[];
    useAsDefault: boolean;
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
 * - `useAsDefault` is a boolean value. If `true`, the child route will be navigated to if no child
 * route is specified during the navigation.
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
    useAsDefault: boolean;
    aux: string;
    constructor({path, loader, name, data, useAsDefault}: {
        path: string;
        loader: Function;
        name?: string;
        data?: {
            [key: string]: any;
        };
        useAsDefault?: boolean;
    });
}
/**
 * `Redirect` is a type of {@link RouteDefinition} used to route a path to a canonical route.
 *
 * It has the following properties:
 * - `path` is a string that uses the route matcher DSL.
 * - `redirectTo` is an array representing the link DSL.
 *
 * Note that redirects **do not** affect how links are generated. For that, see the `useAsDefault`
 * option.
 *
 * ### Example
 * ```
 * import {RouteConfig} from 'angular2/router';
 *
 * @RouteConfig([
 *   {path: '/', redirectTo: ['/Home'] },
 *   {path: '/home', component: HomeCmp, name: 'Home'}
 * ])
 * class MyApp {}
 * ```
 */
export declare class Redirect implements RouteDefinition {
    path: string;
    redirectTo: any[];
    name: string;
    loader: Function;
    data: any;
    aux: string;
    useAsDefault: boolean;
    constructor({path, redirectTo}: {
        path: string;
        redirectTo: any[];
    });
}
