export declare class ProtractorElement implements TestElement {
    readonly element: ElementFinder;
    constructor(element: ElementFinder);
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

export declare class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
    protected constructor(rawRootElement: ElementFinder, options?: ProtractorHarnessEnvironmentOptions);
    protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder>;
    protected createTestElement(element: ElementFinder): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<ElementFinder[]>;
    protected getDocumentRoot(): ElementFinder;
    waitForTasksOutsideAngular(): Promise<void>;
    static getNativeElement(el: TestElement): ElementFinder;
    static loader(options?: ProtractorHarnessEnvironmentOptions): HarnessLoader;
}

export interface ProtractorHarnessEnvironmentOptions {
    queryFn: (selector: string, root: ElementFinder) => ElementArrayFinder;
}
