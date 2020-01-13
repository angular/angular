export declare function applyChanges(component: {}): void;

export declare function getComponent<T>(element: Element): T | null;

export declare function getContext<T>(element: Element): T | null;

export declare function getDirectives(element: Element): {}[];

export declare function getHostElement(componentOrDirective: {}): Element;

export declare function getInjector(elementOrDir: Element | {}): Injector;

export declare function getListeners(element: Element): Listener[];

export declare function getOwningComponent<T>(elementOrDir: Element | {}): T | null;

export declare function getRootComponents(elementOrDir: Element | {}): {}[];

export interface Listener {
    callback: (value: any) => any;
    element: Element;
    name: string;
    type: 'dom' | 'output';
    useCapture: boolean;
}
