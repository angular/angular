export declare function getComponent<T = {}>(element: Element): T | null;

export declare function getContext<T = {}>(element: Element): T | null;

export declare function getDirectives(target: {}): Array<{}>;

export declare function getHostElement<T>(directive: T): Element;

export declare function getInjector(target: {}): Injector;

export declare function getListeners(element: Element): Listener[];

export declare function getRootComponents(target: {}): any[];

export declare function getViewComponent<T = {}>(element: Element | {}): T | null;

export declare function markDirty<T>(component: T): void;
