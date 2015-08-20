import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {Type} from 'angular2/src/core/facade/lang';

export interface RouteHandler {
  componentType: Type;
  resolveComponentType(): Promise<any>;
  data?: Object;
}
