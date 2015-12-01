export declare class RouteLifecycleHook {
    name: string;
    constructor(name: string);
}
export declare class CanActivate {
    fn: Function;
    constructor(fn: Function);
}
export declare const routerCanReuse: RouteLifecycleHook;
export declare const routerCanDeactivate: RouteLifecycleHook;
export declare const routerOnActivate: RouteLifecycleHook;
export declare const routerOnReuse: RouteLifecycleHook;
export declare const routerOnDeactivate: RouteLifecycleHook;
