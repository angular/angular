export declare class ProtractorElement implements TestElement {
    readonly element: ElementFinder;
    constructor(element: ElementFinder);
    blur(): Promise<void>;
    clear(): Promise<void>;
    click(...args: [] | ['center'] | [number, number]): Promise<void>;
    dispatchEvent(name: string): Promise<void>;
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
    rightClick(...args: [] | ['center'] | [number, number]): Promise<void>;
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
