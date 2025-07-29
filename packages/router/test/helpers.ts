/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '@angular/core';

import {Data, ResolveData, Route} from '../src/models';
import {ActivatedRouteSnapshot} from '../src/router_state';
import {Params} from '../src/shared';
import {UrlSegment, UrlTree} from '../src/url_tree';

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
    args.queryParams || null,
    args.fragment || null,
    args.data || null,
    args.outlet || null,
    args.component,
    args.routeConfig || {},
    args.resolve || {},
  );
}

export async function timeout(ms?: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useAutoTick() {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().autoTick();
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });
}
