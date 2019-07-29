export declare function createFakeEvent(type: string, canBubble?: boolean, cancelable?: boolean): Event;

export declare function createKeyboardEvent(type: string, keyCode: number, target?: Element, key?: string): any;

export declare function createMouseEvent(type: string, x?: number, y?: number, button?: number): MouseEvent;

export declare function createTouchEvent(type: string, pageX?: number, pageY?: number): UIEvent;

export declare function dispatchEvent(node: Node | Window, event: Event): Event;

export declare function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event;

export declare function dispatchKeyboardEvent(node: Node, type: string, keyCode: number, target?: Element): KeyboardEvent;

export declare function dispatchMouseEvent(node: Node, type: string, x?: number, y?: number, event?: MouseEvent): MouseEvent;

export declare function dispatchTouchEvent(node: Node, type: string, x?: number, y?: number): Event;

export declare function patchElementFocus(element: HTMLElement): void;

export declare function triggerBlur(element: HTMLElement): void;

export declare function triggerFocus(element: HTMLElement): void;

export declare function typeInElement(value: string, element: HTMLInputElement): void;
