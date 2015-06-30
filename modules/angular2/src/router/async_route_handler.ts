import {RouteHandler} from './route_handler';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {Type} from 'angular2/src/facade/lang';

export class AsyncRouteHandler implements RouteHandler {
  _resolvedComponent: Promise<any> = null;
  componentType: Type;

  constructor(private _loader: Function) {}

  resolveComponentType(): Promise<any> {
    return this._resolvedComponent = this._loader().then((componentType) => {
      this.componentType = componentType;
      return componentType;
    });
  }
}
