import { Promise } from 'angular2/src/facade/async';
import { Type } from 'angular2/src/facade/lang';
import { OpaqueToken } from 'angular2/core';
import { RouteDefinition } from './route_config_impl';
import { Instruction } from './instruction';
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
export declare const ROUTER_PRIMARY_COMPONENT: OpaqueToken;
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
export declare class RouteRegistry {
    private _rootComponent;
    private _rules;
    constructor(_rootComponent: Type);
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    config(parentComponent: any, config: RouteDefinition): void;
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    configFromComponent(component: any): void;
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    recognize(url: string, ancestorInstructions: Instruction[]): Promise<Instruction>;
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    private _recognize(parsedUrl, ancestorInstructions, _aux?);
    private _auxRoutesToUnresolved(auxRoutes, parentInstructions);
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    generate(linkParams: any[], ancestorInstructions: Instruction[], _aux?: boolean): Instruction;
    private _generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
    hasRoute(name: string, parentComponent: any): boolean;
    generateDefault(componentCursor: Type): Instruction;
}
