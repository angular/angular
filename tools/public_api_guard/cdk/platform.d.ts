export declare function getRtlScrollAxisType(): RtlScrollAxisType;

export declare function getSupportedInputTypes(): Set<string>;

export declare function normalizePassiveListenerOptions(options: AddEventListenerOptions): AddEventListenerOptions | boolean;

export declare class Platform {
    ANDROID: boolean;
    BLINK: boolean;
    EDGE: boolean;
    FIREFOX: boolean;
    IOS: boolean;
    SAFARI: boolean;
    TRIDENT: boolean;
    WEBKIT: boolean;
    isBrowser: boolean;
    constructor(_platformId?: Object | undefined);
}

export declare class PlatformModule {
}

export declare enum RtlScrollAxisType {
    NORMAL = 0,
    NEGATED = 1,
    INVERTED = 2
}

export declare function supportsPassiveEventListeners(): boolean;

export declare function supportsScrollBehavior(): boolean;
