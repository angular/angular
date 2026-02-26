/****************************************************************************************************
 * PARTIAL FILE: control_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class FormField {
    formField = input(...(ngDevMode ? [undefined, { debugName: "formField" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FormField, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: FormField, isStandalone: true, selector: "[formField]", inputs: { formField: { classPropertyName: "formField", publicName: "formField", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FormField, decorators: [{
            type: Directive,
            args: [{ selector: '[formField]' }]
        }], propDecorators: { formField: [{ type: i0.Input, args: [{ isSignal: true, alias: "formField", required: false }] }] } });
export class MyComponent {
    value = 'Hello, world!';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div formField="Not a form control"></div>
    <div [attr.formField]="value">Not a form control either.</div>
    <input [formField]="value">
  `, isInline: true, dependencies: [{ kind: "directive", type: FormField, selector: "[formField]", inputs: ["formField"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div formField="Not a form control"></div>
    <div [attr.formField]="value">Not a form control either.</div>
    <input [formField]="value">
  `,
                    imports: [FormField],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: control_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class FormField {
    readonly formField: import("@angular/core").InputSignal<string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormField, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FormField, "[formField]", never, { "formField": { "alias": "formField"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export declare class MyComponent {
    value: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: radio_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class FormField {
    formField = input(...(ngDevMode ? [undefined, { debugName: "formField" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FormField, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: FormField, isStandalone: true, selector: "[formField]", inputs: { formField: { classPropertyName: "formField", publicName: "formField", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FormField, decorators: [{
            type: Directive,
            args: [{ selector: '[formField]' }]
        }], propDecorators: { formField: [{ type: i0.Input, args: [{ isSignal: true, alias: "formField", required: false }] }] } });
// Notice that we check that the binding order doesn't matter
export class MyComponent {
    value = 'foo';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <input
        type="radio"
        [formField]="value"
        [value]="'foo'"
        id="radio"
      />

      <input
        type="radio"
        [value]="'foo'"
        [formField]="value"
        id="radio"
      />
  `, isInline: true, dependencies: [{ kind: "directive", type: FormField, selector: "[formField]", inputs: ["formField"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <input
        type="radio"
        [formField]="value"
        [value]="'foo'"
        id="radio"
      />

      <input
        type="radio"
        [value]="'foo'"
        [formField]="value"
        id="radio"
      />
  `,
                    imports: [FormField],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: radio_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class FormField {
    readonly formField: import("@angular/core").InputSignal<string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FormField, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FormField, "[formField]", never, { "formField": { "alias": "formField"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export declare class MyComponent {
    value: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

