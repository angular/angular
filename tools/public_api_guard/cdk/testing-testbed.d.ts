export declare class TestbedHarnessEnvironment extends HarnessEnvironment<Element> {
    protected constructor(rawRootElement: Element, _fixture: ComponentFixture<unknown>, options?: TestbedHarnessEnvironmentOptions);
    protected createEnvironment(element: Element): HarnessEnvironment<Element>;
    protected createTestElement(element: Element): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<Element[]>;
    protected getDocumentRoot(): Element;
    waitForTasksOutsideAngular(): Promise<void>;
    static documentRootLoader(fixture: ComponentFixture<unknown>, options?: TestbedHarnessEnvironmentOptions): HarnessLoader;
    static getNativeElement(el: TestElement): Element;
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
    click(modifiers?: ModifierKeys): Promise<void>;
    click(location: 'center', modifiers?: ModifierKeys): Promise<void>;
    click(relativeX: number, relativeY: number, modifiers?: ModifierKeys): Promise<void>;
    dispatchEvent(name: string, data?: Record<string, EventData>): Promise<void>;
    focus(): Promise<void>;
    getAttribute(name: string): Promise<string | null>;
    getCssValue(property: string): Promise<string>;
    getDimensions(): Promise<ElementDimensions>;
    getProperty<T = any>(name: string): Promise<T>;
    hasClass(name: string): Promise<boolean>;
    hover(): Promise<void>;
    isFocused(): Promise<boolean>;
    matchesSelector(selector: string): Promise<boolean>;
    mouseAway(): Promise<void>;
    rightClick(relativeX: number, relativeY: number, modifiers?: ModifierKeys): Promise<void>;
    selectOptions(...optionIndexes: number[]): Promise<void>;
    sendKeys(...keys: (string | TestKey)[]): Promise<void>;
    sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
    setInputValue(value: string): Promise<void>;
    text(options?: TextOptions): Promise<string>;
}
