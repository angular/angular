import { Promise } from 'angular2/src/facade/async';
import { Type } from 'angular2/src/facade/lang';
import { RouteDefinition } from './route_config_impl';
import { Instruction } from './instruction';
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
export declare class RouteRegistry {
    private _rules;
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
    recognize(url: string, ancestorComponents: any[]): Promise<Instruction>;
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    private _recognize(parsedUrl, ancestorComponents, _aux?);
    private _auxRoutesToUnresolved(auxRoutes, parentComponent);
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    generate(linkParams: any[], ancestorComponents: any[], _aux?: boolean): Instruction;
    private _generate(linkParams, ancestorComponents, _aux?);
    hasRoute(name: string, parentComponent: any): boolean;
    generateDefault(componentCursor: Type): Instruction;
}
