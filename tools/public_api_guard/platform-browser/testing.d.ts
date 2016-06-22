export declare var browserDetection: BrowserDetection;

export declare class BrowserDetection {
    static setup(): void;
    constructor(ua: string);
    isFirefox: boolean;
    isAndroid: boolean;
    isEdge: boolean;
    isIE: boolean;
    isWebkit: boolean;
    isIOS7: boolean;
    isSlow: boolean;
    supportsIntlApi: boolean;
    isChromeDesktop: boolean;
}

export declare function dispatchEvent(element: any, eventType: any): void;

export declare function el(html: string): HTMLElement;

export declare var expect: (actual: any) => NgMatchers;

export interface NgMatchers extends jasmine.Matchers {
    toBePromise(): boolean;
    toBeAnInstanceOf(expected: any): boolean;
    toHaveText(expected: any): boolean;
    toHaveCssClass(expected: any): boolean;
    toHaveCssStyle(expected: any): boolean;
    toImplement(expected: any): boolean;
    toContainError(expected: any): boolean;
    not: NgMatchers;
}

export declare function normalizeCSS(css: string): string;

export declare function stringifyElement(el: any): string;

export declare const TEST_BROWSER_APPLICATION_PROVIDERS: Array<any>;

export declare const TEST_BROWSER_PLATFORM_PROVIDERS: Array<any>;
