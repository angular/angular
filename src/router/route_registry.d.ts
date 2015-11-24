import { Instruction } from './instruction';
import { Promise } from 'angular2/src/facade/async';
import { RouteDefinition } from './route_config_impl';
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
    recognize(url: string, parentComponent: any): Promise<Instruction>;
    private _recognize(parsedUrl, parentComponent);
    private _recognizePrimaryRoute(parsedUrl, parentComponent);
    private _completePrimaryRouteMatch(partialMatch);
    private _completeAuxiliaryRouteMatches(instruction, parentComponent);
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     */
    generate(linkParams: any[], parentComponent: any): Instruction;
    hasRoute(name: string, parentComponent: any): boolean;
    private _generateRedirects(componentCursor);
}
