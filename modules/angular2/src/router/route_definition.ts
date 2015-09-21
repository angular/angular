import {CONST, Type} from 'angular2/src/core/facade/lang';

/**
 * `RouteDefinition` defines a route within a {@link RouteConfig} decorator.
 *
 * Supported keys:
 * - `path` (required)
 * - `component`, `loader`,  `redirectTo` (requires exactly one of these)
 * - `as` (optional)
 * - `data` (optional)
 *
 * See also {@link Route}, {@link AsyncRoute}, {@link AuxRoute}, and {@link Redirect}.
 */
export interface RouteDefinition {
  path: string;
  component?: Type | ComponentDefinition;
  loader?: Function;
  redirectTo?: string;
  as?: string;
  data?: any;
}

export interface ComponentDefinition {
  type: string;
  loader?: Function;
  component?: Type;
}
