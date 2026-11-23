import * as i0 from "@angular/core";
export declare class MyComponent {
    componentInput: any;
    originalComponentInput: any;
    componentOutput: any;
    originalComponentOutput: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, { "componentInput": { "alias": "componentInput"; "required": false; }; "originalComponentInput": { "alias": "renamedComponentInput"; "required": false; }; }, { "componentOutput": "componentOutput"; "originalComponentOutput": "renamedComponentOutput"; }, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

