/** @stable */
export declare class BrowserDynamicTestModule {
}

/** @experimental */
export declare const browserDynamicTestPlatform: typeof browserTestPlatform;

/** @stable */
export declare function browserTestCompiler({providers, useJit}?: {
    providers?: Array<Type | Provider | any[]>;
    useJit?: boolean;
}): Compiler;
