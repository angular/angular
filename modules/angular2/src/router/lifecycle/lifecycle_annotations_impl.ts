import {CONST, CONST_EXPR} from 'angular2/src/facade/lang';

@CONST()
export class RouteLifecycleHook {
  constructor(public name: string) {}
}

@CONST()
export class CanActivate {
  constructor(public fn: Function) {}
}

export const routerCanReuse: RouteLifecycleHook =
    CONST_EXPR(new RouteLifecycleHook("routerCanReuse"));
export const routerCanDeactivate: RouteLifecycleHook =
    CONST_EXPR(new RouteLifecycleHook("routerCanDeactivate"));
export const routerOnActivate: RouteLifecycleHook =
    CONST_EXPR(new RouteLifecycleHook("routerOnActivate"));
export const routerOnReuse: RouteLifecycleHook =
    CONST_EXPR(new RouteLifecycleHook("routerOnReuse"));
export const routerOnDeactivate: RouteLifecycleHook =
    CONST_EXPR(new RouteLifecycleHook("routerOnDeactivate"));
