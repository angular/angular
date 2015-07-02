import {CONST} from 'angular2/src/facade/lang';
import {List, Map} from 'angular2/src/facade/collection';

/**
 * You use the RouteConfig annotation to add routes to a component.
 *
 * Supported keys:
 * - `path` (required)
 * - `component`,  `redirectTo` (requires exactly one of these)
 * - `as` (optional)
 */
@CONST()
export class RouteConfig {
  constructor(public configs: List<Map<any, any>>) {}
}
