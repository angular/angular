import {CONST} from 'angular2/src/facade/lang';
import {List, Map} from 'angular2/src/facade/collection';

/**
 * You use the RouteConfig annotation to add routes to a component.
 *
 * Supported keys:
 * - `path` (required)
 * - `component` or `components` (requires exactly one of these)
 * - `as` (optional)
 */
export class RouteConfig {
  configs:List<Map>;
  @CONST()
  constructor(configs:List<Map>) {
    this.configs = configs;
  }
}
