import * as i0 from "@angular/core";
export declare class DivDir {
    ternary: any;
    pipe: any;
    and: any;
    or: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DivDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DivDir, "div", never, { "ternary": { "alias": "ternary"; "required": false; }; "pipe": { "alias": "pipe"; "required": false; }; "and": { "alias": "and"; "required": false; }; "or": { "alias": "or"; "required": false; }; }, {}, never, never, false, never>;
}
export declare class PipePipe {
    transform(v: any, a: any, a2: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<PipePipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<PipePipe, "pipe", false>;
}
export declare class MyComponent {
    id: string;
    cond: string;
    value: string;
    a: string;
    b: string;
    c: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

