export declare type AsyncFactoryFn<T> = () => Promise<T>;

export declare type AsyncOptionPredicate<T, O> = (item: T, option: O) => Promise<boolean>;

export declare type AsyncPredicate<T> = (item: T) => Promise<boolean>;

export interface BaseHarnessFilters {
    ancestor?: string;
    selector?: string;
}

export declare abstract class ComponentHarness {
    protected readonly locatorFactory: LocatorFactory;
    constructor(locatorFactory: LocatorFactory);
    protected documentRootLocatorFactory(): LocatorFactory;
    protected forceStabilize(): Promise<void>;
    host(): Promise<TestElement>;
    protected locatorFor<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T>>;
    protected locatorForAll<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T>[]>;
    protected locatorForOptional<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T> | null>;
    protected waitForTasksOutsideAngular(): Promise<void>;
}

export interface ComponentHarnessConstructor<T extends ComponentHarness> {
    hostSelector: string;
    new (locatorFactory: LocatorFactory): T;
}

export declare abstract class ContentContainerComponentHarness<S extends string = string> extends ComponentHarness implements HarnessLoader {
    getAllChildLoaders(selector: S): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
    getChildLoader(selector: S): Promise<HarnessLoader>;
    getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;
}

export interface ElementDimensions {
    height: number;
    left: number;
    top: number;
    width: number;
}

export declare abstract class HarnessEnvironment<E> implements HarnessLoader, LocatorFactory {
    protected rawRootElement: E;
    rootElement: TestElement;
    protected constructor(rawRootElement: E);
    protected createComponentHarness<T extends ComponentHarness>(harnessType: ComponentHarnessConstructor<T>, element: E): T;
    protected abstract createEnvironment(element: E): HarnessEnvironment<E>;
    protected abstract createTestElement(element: E): TestElement;
    documentRootLocatorFactory(): LocatorFactory;
    abstract forceStabilize(): Promise<void>;
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
    protected abstract getAllRawElements(selector: string): Promise<E[]>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    protected abstract getDocumentRoot(): E;
    getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;
    harnessLoaderFor(selector: string): Promise<HarnessLoader>;
    harnessLoaderForAll(selector: string): Promise<HarnessLoader[]>;
    harnessLoaderForOptional(selector: string): Promise<HarnessLoader | null>;
    locatorFor<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T>>;
    locatorForAll<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T>[]>;
    locatorForOptional<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T> | null>;
    rootHarnessLoader(): Promise<HarnessLoader>;
    abstract waitForTasksOutsideAngular(): Promise<void>;
}

export interface HarnessLoader {
    getAllChildLoaders(selector: string): Promise<HarnessLoader[]>;
    getAllHarnesses<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T[]>;
    getChildLoader(selector: string): Promise<HarnessLoader>;
    getHarness<T extends ComponentHarness>(query: HarnessQuery<T>): Promise<T>;
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
    static stringMatches(value: string | null | Promise<string | null>, pattern: string | RegExp | null): Promise<boolean>;
}

export declare type HarnessQuery<T extends ComponentHarness> = ComponentHarnessConstructor<T> | HarnessPredicate<T>;

export interface LocatorFactory {
    rootElement: TestElement;
    documentRootLocatorFactory(): LocatorFactory;
    forceStabilize(): Promise<void>;
    harnessLoaderFor(selector: string): Promise<HarnessLoader>;
    harnessLoaderForAll(selector: string): Promise<HarnessLoader[]>;
    harnessLoaderForOptional(selector: string): Promise<HarnessLoader | null>;
    locatorFor<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T>>;
    locatorForAll<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T>[]>;
    locatorForOptional<T extends (HarnessQuery<any> | string)[]>(...queries: T): AsyncFactoryFn<LocatorFnResult<T> | null>;
    rootHarnessLoader(): Promise<HarnessLoader>;
    waitForTasksOutsideAngular(): Promise<void>;
}

export declare type LocatorFnResult<T extends (HarnessQuery<any> | string)[]> = {
    [I in keyof T]: T[I] extends new (...args: any[]) => infer C ? C : T[I] extends {
        harnessType: new (...args: any[]) => infer C;
    } ? C : T[I] extends string ? TestElement : never;
}[number];

export interface ModifierKeys {
    alt?: boolean;
    control?: boolean;
    meta?: boolean;
    shift?: boolean;
}

export interface TestElement {
    blur(): Promise<void>;
    clear(): Promise<void>;
    click(): Promise<void>;
    click(relativeX: number, relativeY: number): Promise<void>;
    focus(): Promise<void>;
    getAttribute(name: string): Promise<string | null>;
    getCssValue(property: string): Promise<string>;
    getDimensions(): Promise<ElementDimensions>;
    getProperty(name: string): Promise<any>;
    hasClass(name: string): Promise<boolean>;
    hover(): Promise<void>;
    isFocused(): Promise<boolean>;
    matchesSelector(selector: string): Promise<boolean>;
    mouseAway(): Promise<void>;
    sendKeys(...keys: (string | TestKey)[]): Promise<void>;
    sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
    setInputValue?(value: string): Promise<void>;
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
