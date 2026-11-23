import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never, false, [{ directive: typeof DirectiveB; inputs: {}; outputs: {}; }]>;
}
export declare class DirectiveB {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveB, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveB, never, never, {}, {}, never, never, true, [{ directive: typeof DirectiveA; inputs: { "value": "value"; }; outputs: {}; }]>;
}
export declare class DirectiveA {
    value: any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, never, never, { "value": { "alias": "value"; "required": false; }; }, {}, never, never, true, never>;
}

