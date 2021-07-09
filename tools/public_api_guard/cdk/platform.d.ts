export declare function _getEventTarget<T extends EventTarget>(event: Event): T | null;

export declare function _getFocusedElementPierceShadowDom(): HTMLElement | null;

export declare function _getShadowRoot(element: HTMLElement): ShadowRoot | null;

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
    constructor(_platformId: Object);
    static ɵfac: i0.ɵɵFactoryDeclaration<Platform, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Platform>;
}

export declare class PlatformModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<PlatformModule, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<PlatformModule>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<PlatformModule, never, never, never>;
}

export declare const enum RtlScrollAxisType {
    NORMAL = 0,
    NEGATED = 1,
    INVERTED = 2
}

export declare function supportsPassiveEventListeners(): boolean;

export declare function supportsScrollBehavior(): boolean;
