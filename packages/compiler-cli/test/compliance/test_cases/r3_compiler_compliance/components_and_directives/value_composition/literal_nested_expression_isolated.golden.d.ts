import * as i0 from "@angular/core";
export declare class NestedComp {
    config: {
        [key: string]: any;
    };
    static ɵfac: i0.ɵɵFactoryDeclaration<NestedComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NestedComp, "nested-comp", never, { "config": { "alias": "config"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class MyApp {
    name: string;
    duration: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

