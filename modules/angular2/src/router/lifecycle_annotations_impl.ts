import {CONST, CONST_EXPR} from 'angular2/src/facade/lang';

@CONST()
export class RouteLifecycleHook {
  constructor(public name: string) {}
}

@CONST()
export class CanActivate {
  constructor(public fn: Function) {}
}

export const canReuse: RouteLifecycleHook = CONST_EXPR(new RouteLifecycleHook("canReuse"));
export const canDeactivate: RouteLifecycleHook =
    CONST_EXPR(new RouteLifecycleHook("canDeactivate"));
export const onActivate: RouteLifecycleHook = CONST_EXPR(new RouteLifecycleHook("onActivate"));
export const onReuse: RouteLifecycleHook = CONST_EXPR(new RouteLifecycleHook("onReuse"));
export const onDeactivate: RouteLifecycleHook = CONST_EXPR(new RouteLifecycleHook("onDeactivate"));
