import {CONST} from 'angular2/src/facade/lang';

/**
 * You use the RouteConfig annotation to ...
 */
export class RouteConfig {
  path:string;
  redirectTo:string;
  component:any;
  //TODO: "alias," or "as"

  @CONST()
  constructor({path, component, redirectTo}:{path:string, component:any, redirectTo:string} = {}) {
    this.path = path;
    this.component = component;
    this.redirectTo = redirectTo;
  }
}
