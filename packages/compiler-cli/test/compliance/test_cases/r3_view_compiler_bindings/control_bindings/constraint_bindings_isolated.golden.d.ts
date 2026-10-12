import * as i0 from "@angular/core";
export declare class FormField {
    readonly formField: import("@angular/core").InputSignal<string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormField, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FormField, "[formField]", never, { "formField": { "alias": "formField"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export declare class RangeControl {
    readonly min: import("@angular/core").InputSignal<string | number>;
    readonly max: import("@angular/core").ModelSignal<number>;
    readonly minLength: import("@angular/core").InputSignal<string>;
    readonly maxLength: import("@angular/core").InputSignal<number>;
    static ɵfac: i0.ɵɵFactoryDeclaration<RangeControl, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<RangeControl, "range-control", never, { "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "minLength": { "alias": "minLength"; "required": false; "isSignal": true; }; "maxLength": { "alias": "maxLength"; "required": false; "isSignal": true; }; }, { "max": "maxChange"; }, never, never, true, never>;
}
export declare class MyComponent {
    field: string;
    minimum: number;
    maximum: import("@angular/core").WritableSignal<number>;
    length: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, true, never>;
}
