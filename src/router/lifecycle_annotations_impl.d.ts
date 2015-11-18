export declare class RouteLifecycleHook {
    name: string;
    constructor(name: string);
}
export declare class CanActivate {
    fn: Function;
    constructor(fn: Function);
}
export declare const canReuse: RouteLifecycleHook;
export declare const canDeactivate: RouteLifecycleHook;
export declare const onActivate: RouteLifecycleHook;
export declare const onReuse: RouteLifecycleHook;
export declare const onDeactivate: RouteLifecycleHook;
