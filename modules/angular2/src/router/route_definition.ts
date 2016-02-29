import {CONST, Type} from 'angular2/src/facade/lang';
import {RegexSerializer} from './rules/route_paths/regex_route_path';

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
  regex?: string;
  serializer?: RegexSerializer;
  component?: Type | ComponentDefinition;
  loader?: Function;
  redirectTo?: any[];
  as?: string;
  name?: string;
  data?: any;
  useAsDefault?: boolean;
}

/**
 * Represents either a component type (`type` is `component`) or a loader function
 * (`type` is `loader`).
 *
 * See also {@link RouteDefinition}.
 */
export interface ComponentDefinition {
  type: string;
  loader?: Function;
  component?: Type;
}
