export declare type AsyncFactoryFn<T> = () => Promise<T>;

export declare type AsyncOptionPredicate<T, O> = (item: T, option: O) => Promise<boolean>;

export declare type AsyncPredicate<T> = (item: T) => Promise<boolean>;

export interface BaseHarnessFilters {
    ancestor?: string;
    selector?: string;
}

export declare function clearElement(element: HTMLInputElement | HTMLTextAreaElement): void;

export declare abstract class ComponentHarness {
    constructor(locatorFactory: LocatorFactory);
    protected documentRootLocatorFactory(): LocatorFactory;
    host(): Promise<TestElement>;
    protected locatorFor(selector: string): AsyncFactoryFn<TestElement>;
    protected locatorFor<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T>;
    protected locatorForAll(selector: string): AsyncFactoryFn<TestElement[]>;
    protected locatorForAll<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T[]>;
    protected locatorForOptional(selector: string): AsyncFactoryFn<TestElement | null>;
    protected locatorForOptional<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T | null>;
}

export interface ComponentHarnessConstructor<T extends ComponentHarness> {
    hostSelector: string;
    new (locatorFactory: LocatorFactory): T;
}

export declare function createFakeEvent(type: string, canBubble?: boolean, cancelable?: boolean): Event;

export declare function createKeyboardEvent(type: string, keyCode?: number, key?: string, target?: Element, modifiers?: ModifierKeys): any;

export declare function createMouseEvent(type: string, x?: number, y?: number, button?: number): MouseEvent;

export declare function createTouchEvent(type: string, pageX?: number, pageY?: number): UIEvent;

export declare function dispatchEvent(node: Node | Window, event: Event): Event;

export declare function dispatchFakeEvent(node: Node | Window, type: string, canBubble?: boolean): Event;

export declare function dispatchKeyboardEvent(node: Node, type: string, keyCode?: number, key?: string, target?: Element, modifiers?: ModifierKeys): KeyboardEvent;

export declare function dispatchMouseEvent(node: Node, type: string, x?: number, y?: number, event?: MouseEvent): MouseEvent;

export declare function dispatchTouchEvent(node: Node, type: string, x?: number, y?: number): Event;

export declare abstract class HarnessEnvironment<E> implements HarnessLoader, LocatorFactory {
    protected rawRootElement: E;
    rootElement: TestElement;
    protected constructor(rawRootElement: E);
    protected createComponentHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>, element: E): T;
    protected abstract createEnvironment(element: E): HarnessEnvironment<E>;
    protected abstract createTestElement(element: E): TestElement;
    documentRootLocatorFactory(): LocatorFactory;
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T[]>;
    protected abstract getAllRawElements(selector: string): Promise<E[]>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    protected abstract getDocumentRoot(): E;
    getHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T>;
    locatorFor<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T>;
    locatorFor(selector: string): AsyncFactoryFn<TestElement>;
    locatorForAll<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T[]>;
    locatorForAll(selector: string): AsyncFactoryFn<TestElement[]>;
    locatorForOptional<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T | null>;
    locatorForOptional(selector: string): AsyncFactoryFn<TestElement | null>;
}

export interface HarnessLoader {
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T[]>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    getHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): Promise<T>;
}

export declare class HarnessPredicate<T extends ComponentHarness> {
    harnessType: ComponentHarnessConstructor<T>;
    constructor(harnessType: ComponentHarnessConstructor<T>, options: BaseHarnessFilters);
    add(description: string, predicate: AsyncPredicate<T>): this;
    addOption<O>(name: string, option: O | undefined, predicate: AsyncOptionPredicate<T, O>): this;
    evaluate(harness: T): Promise<boolean>;
    filter(harnesses: T[]): Promise<T[]>;
    getDescription(): string;
    getSelector(): string;
    static stringMatches(s: string | Promise<string>, pattern: string | RegExp): Promise<boolean>;
}

export declare function isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement;

export interface LocatorFactory {
    rootElement: TestElement;
    documentRootLocatorFactory(): LocatorFactory;
    locatorFor(selector: string): AsyncFactoryFn<TestElement>;
    locatorFor<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T>;
    locatorForAll(selector: string): AsyncFactoryFn<TestElement[]>;
    locatorForAll<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T[]>;
    locatorForOptional(selector: string): AsyncFactoryFn<TestElement | null>;
    locatorForOptional<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T> | HarnessPredicate<T>): AsyncFactoryFn<T | null>;
}

export interface ModifierKeys {
    alt?: boolean;
    control?: boolean;
    meta?: boolean;
    shift?: boolean;
}

export declare function patchElementFocus(element: HTMLElement): void;

export interface TestElement {
    blur(): Promise<void>;
    clear(): Promise<void>;
    click(relativeX?: number, relativeY?: number): Promise<void>;
    focus(): Promise<void>;
    forceStabilize(): Promise<void>;
    getAttribute(name: string): Promise<string | null>;
    getCssValue(property: string): Promise<string>;
    getDimensions(): Promise<ElementDimensions>;
    getProperty(name: string): Promise<any>;
    hasClass(name: string): Promise<boolean>;
    hover(): Promise<void>;
    matchesSelector(selector: string): Promise<boolean>;
    sendKeys(...keys: (string | TestKey)[]): Promise<void>;
    sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
    text(): Promise<string>;
}

export declare enum TestKey {
    BACKSPACE = 0,
    TAB = 1,
    ENTER = 2,
    SHIFT = 3,
    CONTROL = 4,
    ALT = 5,
    ESCAPE = 6,
    PAGE_UP = 7,
    PAGE_DOWN = 8,
    END = 9,
    HOME = 10,
    LEFT_ARROW = 11,
    UP_ARROW = 12,
    RIGHT_ARROW = 13,
    DOWN_ARROW = 14,
    INSERT = 15,
    DELETE = 16,
    F1 = 17,
    F2 = 18,
    F3 = 19,
    F4 = 20,
    F5 = 21,
    F6 = 22,
    F7 = 23,
    F8 = 24,
    F9 = 25,
    F10 = 26,
    F11 = 27,
    F12 = 28,
    META = 29
}

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
