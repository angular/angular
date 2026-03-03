/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, Type} from '@angular/core';

import {Data, ResolveData, Route} from '../src/models';
import {ActivatedRouteSnapshot} from '../src/router_state';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {UrlSegment, UrlTree} from '../src/url_tree';
import {TestBed} from '@angular/core/testing';

export class Logger {
  logs: string[] = [];
  add(thing: string) {
    this.logs.push(thing);
  }
  empty() {
    this.logs.length = 0;
  }
}

export declare type ARSArgs = {
  url?: UrlSegment[];
  params?: Params;
  queryParams?: Params;
  fragment?: string;
  data?: Data;
  outlet?: string;
  component: Type<unknown> | string | null;
  routeConfig?: Route | null;
  resolve?: ResolveData;
};

export function createActivatedRouteSnapshot(args: ARSArgs): ActivatedRouteSnapshot {
  return new (ActivatedRouteSnapshot as any)(
    args.url || [],
    args.params || {},
    args.queryParams || {},
    args.fragment || null,
    args.data || {},
    args.outlet || PRIMARY_OUTLET,
    args.component as any,
    args.routeConfig || {},
    args.resolve || {},
    TestBed.inject(EnvironmentInjector),
  );
}
