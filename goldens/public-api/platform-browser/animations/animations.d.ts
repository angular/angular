export declare const ANIMATION_MODULE_TYPE: InjectionToken<"NoopAnimations" | "BrowserAnimations">;

export declare class BrowserAnimationsModule {
    static withConfig(config: BrowserAnimationsModuleConfig): ModuleWithProviders<BrowserAnimationsModule>;
}

export declare interface BrowserAnimationsModuleConfig {
    disableAnimations?: boolean;
}

export declare class NoopAnimationsModule {
}
