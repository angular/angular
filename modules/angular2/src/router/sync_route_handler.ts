import {RouteHandler} from './route_handler';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Type} from 'angular2/src/facade/lang';

export class SyncRouteHandler implements RouteHandler {
  _resolvedComponent: Promise<any> = null;

  constructor(public componentType: Type) {
    this._resolvedComponent = PromiseWrapper.resolve(componentType);
  }

  resolveComponentType(): Promise<any> { return this._resolvedComponent; }
}
