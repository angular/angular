import * as i0 from "@angular/core";
export declare class A1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A1Component, "a1", never, {}, {}, never, never, false, never>;
}
export declare class A2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A2Component, "a2", never, {}, {}, never, never, false, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, never, never, [typeof A1Component, typeof A2Component]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AModule>;
}
export declare class B1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B1Component, "b1", never, {}, {}, never, never, false, never>;
}
export declare class B2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B2Component, "b2", never, {}, {}, never, never, false, never>;
}
export declare class BModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, never, never, [typeof AModule]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<BModule>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof BModule], never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<AppModule>;
}

