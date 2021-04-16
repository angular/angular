export declare function applyChanges(component: {}): void;

export interface ComponentDebugMetadata extends DirectiveDebugMetadata {
    changeDetection: ChangeDetectionStrategy;
    encapsulation: ViewEncapsulation;
}

export interface DirectiveDebugMetadata {
    inputs: Record<string, string>;
    outputs: Record<string, string>;
}

export declare function getComponent<T>(element: Element): T | null;

export declare function getContext<T>(element: Element): T | null;

export declare function getDirectiveMetadata(directiveOrComponentInstance: any): ComponentDebugMetadata | DirectiveDebugMetadata | null;

export declare function getDirectives(node: Node): {}[];

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
