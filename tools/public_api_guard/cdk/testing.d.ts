export declare function clearElement(element: HTMLInputElement | HTMLTextAreaElement): void;

export declare function createFakeEvent(type: string, canBubble?: boolean, cancelable?: boolean): Event;

export declare function createKeyboardEvent(type: string, keyCode?: number, key?: string, target?: Element, modifiers?: ModifierKeys): any;

export declare function createMouseEvent(type: string, x?: number, y?: number, button?: number): MouseEvent;

export declare function createTouchEvent(type: string, pageX?: number, pageY?: number): UIEvent;

export declare function dispatchEvent(node: Node | Window, event: Event): Event;

export declare function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event;

export declare function dispatchKeyboardEvent(node: Node, type: string, keyCode?: number, key?: string, target?: Element, modifiers?: ModifierKeys): KeyboardEvent;

export declare function dispatchMouseEvent(node: Node, type: string, x?: number, y?: number, event?: MouseEvent): MouseEvent;

export declare function dispatchTouchEvent(node: Node, type: string, x?: number, y?: number): Event;

export declare function isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement;

export interface ModifierKeys {
    alt?: boolean;
    control?: boolean;
    meta?: boolean;
    shift?: boolean;
}

export declare function patchElementFocus(element: HTMLElement): void;

export declare function triggerBlur(element: HTMLElement): void;

export declare function triggerFocus(element: HTMLElement): void;

export declare function typeInElement(element: HTMLElement, ...keys: (string | {
    keyCode?: number;
    key?: string;
})[]): void;
export declare function typeInElement(element: HTMLElement, modifiers: ModifierKeys, ...keys: (string | {
    keyCode?: number;
    key?: string;
})[]): void;
