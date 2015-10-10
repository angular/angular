import {RouteHandler} from './route_handler';
import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {Type} from 'angular2/src/core/facade/lang';

export class SyncRouteHandler implements RouteHandler {
  /** @internal */
  _resolvedComponent: Promise<any> = null;

  constructor(public componentType: Type, public data?: Object) {
    this._resolvedComponent = PromiseWrapper.resolve(componentType);
  }

  resolveComponentType(): Promise<any> { return this._resolvedComponent; }
}
