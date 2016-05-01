/* @ts2dart_const */
export class RouteLifecycleHook {
    constructor(name) {
        this.name = name;
    }
}
/* @ts2dart_const */
export class CanActivate {
    constructor(fn) {
        this.fn = fn;
    }
}
export const routerCanReuse = 
/*@ts2dart_const*/ new RouteLifecycleHook("routerCanReuse");
export const routerCanDeactivate = 
/*@ts2dart_const*/ new RouteLifecycleHook("routerCanDeactivate");
export const routerOnActivate = 
/*@ts2dart_const*/ new RouteLifecycleHook("routerOnActivate");
export const routerOnReuse = 
/*@ts2dart_const*/ new RouteLifecycleHook("routerOnReuse");
export const routerOnDeactivate = 
/*@ts2dart_const*/ new RouteLifecycleHook("routerOnDeactivate");
