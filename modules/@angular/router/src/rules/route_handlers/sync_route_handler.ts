import {PromiseWrapper} from '@angular/facade/async';
import {isPresent, Type} from '@angular/facade/lang';
import {RouteHandler} from './route_handler';
import {RouteData, BLANK_ROUTE_DATA} from '../../instruction';


export class SyncRouteHandler implements RouteHandler {
  public data: RouteData;

  /** @internal */
  _resolvedComponent: Promise<any> = null;

  constructor(public componentType: Type, data?: {[key: string]: any}) {
    this._resolvedComponent = PromiseWrapper.resolve(componentType);
    this.data = isPresent(data) ? new RouteData(data) : BLANK_ROUTE_DATA;
  }

  resolveComponentType(): Promise<any> { return this._resolvedComponent; }
}
