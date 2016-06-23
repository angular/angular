/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PromiseWrapper} from '../../facade/async';
import {Type, isPresent} from '../../facade/lang';
import {BLANK_ROUTE_DATA, RouteData} from '../../instruction';

import {RouteHandler} from './route_handler';


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
