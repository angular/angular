import {CONST} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

/**
 * You use the RouteConfig annotation to ...
 */
export class RouteConfig {
  configs;
  @CONST()
  constructor(configs:List) {
    this.configs = configs;
  }
}
