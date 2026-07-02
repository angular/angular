import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}
export declare class MyComponent {
    constructor(name: string, other: string, s1: MyService, s2: MyService, s4: MyService, s3: MyService, s5: MyService, s6: MyService);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, [{ attribute: "name"; }, { attribute: unknown; }, null, { host: true; }, { self: true; }, { skipSelf: true; }, { optional: true; }, { optional: true; self: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

