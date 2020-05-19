/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

import {Data, ResolveData, Route} from '../src/config';
import {ActivatedRouteSnapshot} from '../src/router_state';
import {convertToParamMap, ParamMap, Params, PRIMARY_OUTLET} from '../src/shared';
import {equalSegments, UrlSegment, UrlSegmentGroup, UrlTree} from '../src/url_tree';

export class Logger {
  logs: string[] = [];
  add(thing: string) {
    this.logs.push(thing);
  }
  empty() {
    this.logs.length = 0;
  }
}

export function provideTokenLogger(token: string, returnValue = true as boolean | UrlTree) {
  return {
    provide: token,
    useFactory: (logger: Logger) => () => (logger.add(token), returnValue),
    deps: [Logger]
  };
}

export declare type ARSArgs = {
  url?: UrlSegment[],
  params?: Params,
  queryParams?: Params,
  fragment?: string,
  data?: Data,
  outlet?: string, component: Type<any>| string | null,
  routeConfig?: Route | null,
  urlSegment?: UrlSegmentGroup,
  lastPathIndex?: number,
  resolve?: ResolveData
};

export function createActivatedRouteSnapshot(args: ARSArgs): ActivatedRouteSnapshot {
  return new (ActivatedRouteSnapshot as any)(
      args.url || <any>[], args.params || {}, args.queryParams || <any>null,
      args.fragment || <any>null, args.data || <any>null, args.outlet || <any>null,
      <any>args.component, args.routeConfig || <any>{}, args.urlSegment || <any>null,
      args.lastPathIndex || -1, args.resolve || {});
}
