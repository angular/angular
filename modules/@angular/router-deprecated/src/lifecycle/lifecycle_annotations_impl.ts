/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export class RouteLifecycleHook {
  constructor(public name: string) {}
}

export class CanActivate {
  constructor(public fn: Function) {}
}

export const routerCanReuse: RouteLifecycleHook = new RouteLifecycleHook('routerCanReuse');
export const routerCanDeactivate: RouteLifecycleHook =
    new RouteLifecycleHook('routerCanDeactivate');
export const routerOnActivate: RouteLifecycleHook = new RouteLifecycleHook('routerOnActivate');
export const routerOnReuse: RouteLifecycleHook = new RouteLifecycleHook('routerOnReuse');
export const routerOnDeactivate: RouteLifecycleHook = new RouteLifecycleHook('routerOnDeactivate');
