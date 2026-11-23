import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, never, never, {}, {}, never, never, true, never>;
}
export declare class DirectiveB {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveB, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, {}, never, never, true, [{ directive: typeof DirectiveA; inputs: {}; outputs: {}; }]>;
}
export declare class DirectiveC {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveC, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveC, never, never, {}, {}, never, never, true, [{ directive: typeof DirectiveB; inputs: {}; outputs: {}; }]>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof DirectiveC; inputs: {}; outputs: {}; }]>;
}

