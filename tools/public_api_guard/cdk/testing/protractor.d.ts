export declare class ProtractorElement implements TestElement {
    readonly element: ElementFinder;
    constructor(element: ElementFinder);
    blur(): Promise<void>;
    clear(): Promise<void>;
    click(relativeX?: number, relativeY?: number): Promise<void>;
    focus(): Promise<void>;
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

export declare class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
    protected constructor(rawRootElement: ElementFinder);
    protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder>;
    protected createTestElement(element: ElementFinder): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<ElementFinder[]>;
    protected getDocumentRoot(): ElementFinder;
    waitForTasksOutsideAngular(): Promise<void>;
    static loader(): HarnessLoader;
}
