export declare function _supportsShadowDom(): boolean;

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
    static ɵfac: i0.ɵɵFactoryDef<Platform>;
    static ɵprov: i0.ɵɵInjectableDef<Platform>;
}

export declare class PlatformModule {
    static ɵinj: i0.ɵɵInjectorDef<PlatformModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<PlatformModule, never, never, never>;
}

export declare enum RtlScrollAxisType {
    NORMAL = 0,
    NEGATED = 1,
    INVERTED = 2
}

export declare function supportsPassiveEventListeners(): boolean;

export declare function supportsScrollBehavior(): boolean;
