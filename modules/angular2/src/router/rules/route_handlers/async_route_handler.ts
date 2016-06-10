import {isPresent, Type} from 'angular2/src/facade/lang';

import {RouteHandler} from './route_handler';
import {RouteData, BLANK_ROUTE_DATA} from '../../instruction';
import {ComponentFactory} from 'angular2/core';

export class AsyncRouteHandler implements RouteHandler {
  /** @internal */
  _resolvedComponent: Promise<Type> = null;
  componentType: Type | ComponentFactory;
  public data: RouteData;

  constructor(private _loader: () => Promise<Type | ComponentFactory>,
              data: {[key: string]: any} = null) {
    this.data = isPresent(data) ? new RouteData(data) : BLANK_ROUTE_DATA;
  }

  resolveComponentType(): Promise<Type | ComponentFactory> {
    if (isPresent(this._resolvedComponent)) {
      return this._resolvedComponent;
    }

    return this._resolvedComponent = this._loader().then((componentType) => {
      this.componentType = componentType;
      return componentType;
    });
  }
}
