/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Routes} from '@angular/router/src/config';
import {recognize} from '@angular/router/src/recognize';
import {RouteSnapshot, RouterStateSnapshot, createRouterStateSnapshot} from '@angular/router/src/router_state';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';

import {Data, ResolveData, Route} from '../src/config';
import {ActivatedRouteSnapshot} from '../src/router_state';
import {PRIMARY_OUTLET, ParamMap, Params, convertToParamMap} from '../src/shared';
import {UrlSegment, UrlSegmentGroup, UrlTree} from '../src/url_tree';

export class Logger {
  logs: string[] = [];
  add(thing: string) { this.logs.push(thing); }
  empty() { this.logs.length = 0; }
}

export function provideTokenLogger(token: string, returnValue = true) {
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
  outlet?: string,
  component: Type<any>| string | null,
  routeConfig?: Route | null,
  urlSegment?: UrlSegmentGroup,
  lastPathIndex?: number,
  resolve?: ResolveData
};

export function createActivatedRouteSnapshot(args: ARSArgs): ActivatedRouteSnapshot {
  return new ActivatedRouteSnapshot(
      args.url || <any>[], args.params || {}, args.queryParams || <any>null,
      args.fragment || <any>null, args.data || <any>null, args.outlet || <any>null,
      <any>args.component, args.routeConfig || <any>{}, args.urlSegment || <any>null,
      args.lastPathIndex || -1, args.resolve || {});
}

export function createRouteSnapshot(args: {
  url?: UrlSegment[],
  params?: Params,
  queryParams?: Params,
  fragment?: string,
  data?: Data,
  outlet?: string,
  configPath?: number[],
  urlTreeAddress?: {urlSegmentGroupPath: string[], urlSegmentIndex: number}
}): RouteSnapshot {
  const defaults = {
    url: [],          // UrlSegment[],
    params: {},       // Params,
    queryParams: {},  // Params,
    fragment: '',
    data: {},  // Data,
    outlet: '',
    configPath: [],  // Path to config,
    urlTreeAddress: {urlSegmentGroupPath: [], urlSegmentIndex: 0}
  };

  return {...defaults, ...args};
}


export function legacyRecognize(
    rootComponentType: Type<any>| null, config: Routes, urlTree: UrlTree,
    url: string): Observable<RouterStateSnapshot> {
  return map.call(
      recognize(rootComponentType, config, urlTree, url),
      (root: any) => createRouterStateSnapshot(url, urlTree, root, rootComponentType, config));
}
