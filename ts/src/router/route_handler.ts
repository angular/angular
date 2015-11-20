import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Type} from 'angular2/src/facade/lang';
import {RouteData} from './instruction';

export interface RouteHandler {
  componentType: Type;
  resolveComponentType(): Promise<any>;
  data: RouteData;
}
