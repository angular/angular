export declare class TestbedHarnessEnvironment extends HarnessEnvironment<Element> {
    protected constructor(rawRootElement: Element, _fixture: ComponentFixture<unknown>, options?: TestbedHarnessEnvironmentOptions);
    protected createEnvironment(element: Element): HarnessEnvironment<Element>;
    protected createTestElement(element: Element): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<Element[]>;
    protected getDocumentRoot(): Element;
    waitForTasksOutsideAngular(): Promise<void>;
    static documentRootLoader(fixture: ComponentFixture<unknown>, options?: TestbedHarnessEnvironmentOptions): HarnessLoader;
    static harnessForFixture<T extends ComponentHarness>(fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>, options?: TestbedHarnessEnvironmentOptions): Promise<T>;
    static loader(fixture: ComponentFixture<unknown>, options?: TestbedHarnessEnvironmentOptions): HarnessLoader;
}

export interface TestbedHarnessEnvironmentOptions {
    queryFn: (selector: string, root: Element) => Iterable<Element> | ArrayLike<Element>;
}

export declare class UnitTestElement implements TestElement {
    readonly element: Element;
    constructor(element: Element, _stabilize: () => Promise<void>);
    blur(): Promise<void>;
    clear(): Promise<void>;
    click(...args: number[]): Promise<void>;
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
    setInputValue(value: string): Promise<void>;
    text(): Promise<string>;
}
