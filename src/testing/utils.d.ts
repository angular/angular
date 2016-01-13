export declare class Log {
    constructor();
    add(value: any): void;
    fn(value: any): (a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) => void;
    clear(): void;
    result(): string;
}
export declare var browserDetection: BrowserDetection;
export declare class BrowserDetection {
    private _ua;
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
}
export declare function dispatchEvent(element: any, eventType: any): void;
export declare function el(html: string): HTMLElement;
export declare function containsRegexp(input: string): RegExp;
export declare function normalizeCSS(css: string): string;
export declare function stringifyElement(el: any): string;
