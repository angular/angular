import { Type } from 'angular2/src/facade/lang';
/**
 * `RouteDefinition` defines a route within a {@link RouteConfig} decorator.
 *
 * Supported keys:
 * - `path` or `aux` (requires exactly one of these)
 * - `component`, `loader`,  `redirectTo` (requires exactly one of these)
 * - `name` or `as` (optional) (requires exactly one of these)
 * - `data` (optional)
 *
 * See also {@link Route}, {@link AsyncRoute}, {@link AuxRoute}, and {@link Redirect}.
 */
export interface RouteDefinition {
    path?: string;
    aux?: string;
    component?: Type | ComponentDefinition;
    loader?: Function;
    redirectTo?: string;
    as?: string;
    name?: string;
    data?: any;
}
export interface ComponentDefinition {
    type: string;
    loader?: Function;
    component?: Type;
}
