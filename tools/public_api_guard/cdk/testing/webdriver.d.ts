export declare function waitForAngularReady(wd: webdriver.WebDriver): Promise<void>;

export declare class WebDriverElement implements TestElement {
    readonly element: () => webdriver.WebElement;
    constructor(element: () => webdriver.WebElement, _stabilize: () => Promise<void>);
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
    getProperty(name: string): Promise<any>;
    hasClass(name: string): Promise<boolean>;
    hover(): Promise<void>;
    isFocused(): Promise<boolean>;
    matchesSelector(selector: string): Promise<boolean>;
    mouseAway(): Promise<void>;
    rightClick(relativeX: number, relativeY: number, modifiers?: ModifierKeys): Promise<void>;
    selectOptions(...optionIndexes: number[]): Promise<void>;
    sendKeys(...keys: (string | TestKey)[]): Promise<void>;
    sendKeys(modifiers: ModifierKeys, ...keys: (string | TestKey)[]): Promise<void>;
    setInputValue(newValue: string): Promise<void>;
    text(options?: TextOptions): Promise<string>;
}

export declare class WebDriverHarnessEnvironment extends HarnessEnvironment<() => webdriver.WebElement> {
    protected constructor(rawRootElement: () => webdriver.WebElement, options?: WebDriverHarnessEnvironmentOptions);
    protected createEnvironment(element: () => webdriver.WebElement): HarnessEnvironment<() => webdriver.WebElement>;
    protected createTestElement(element: () => webdriver.WebElement): TestElement;
    forceStabilize(): Promise<void>;
    protected getAllRawElements(selector: string): Promise<(() => webdriver.WebElement)[]>;
    protected getDocumentRoot(): () => webdriver.WebElement;
    waitForTasksOutsideAngular(): Promise<void>;
    static getNativeElement(el: TestElement): webdriver.WebElement;
    static loader(driver: webdriver.WebDriver, options?: WebDriverHarnessEnvironmentOptions): HarnessLoader;
}

export interface WebDriverHarnessEnvironmentOptions {
    queryFn: (selector: string, root: () => webdriver.WebElement) => Promise<webdriver.WebElement[]>;
}
