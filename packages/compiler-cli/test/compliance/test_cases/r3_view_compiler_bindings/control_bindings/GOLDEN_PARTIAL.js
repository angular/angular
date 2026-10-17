/****************************************************************************************************
 * PARTIAL FILE: control_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class FormField {
    formField = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "formField" }] : /* istanbul ignore next */ []));
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
 * PARTIAL FILE: constraint_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input, model, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class FormField {
    formField = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "formField" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FormField, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: FormField, isStandalone: true, selector: "[formField]", inputs: { formField: { classPropertyName: "formField", publicName: "formField", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FormField, decorators: [{
            type: Directive,
            args: [{ selector: '[formField]' }]
        }], propDecorators: { formField: [{ type: i0.Input, args: [{ isSignal: true, alias: "formField", required: false }] }] } });
export class RangeControl {
    min = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "min" }] : /* istanbul ignore next */ []));
    max = model(100, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "max" }] : /* istanbul ignore next */ []));
    minLength = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "minLength" }] : /* istanbul ignore next */ []));
    maxLength = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maxLength" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RangeControl, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: RangeControl, isStandalone: true, selector: "range-control", inputs: { min: { classPropertyName: "min", publicName: "min", isSignal: true, isRequired: false, transformFunction: null }, max: { classPropertyName: "max", publicName: "max", isSignal: true, isRequired: false, transformFunction: null }, minLength: { classPropertyName: "minLength", publicName: "minLength", isSignal: true, isRequired: false, transformFunction: null }, maxLength: { classPropertyName: "maxLength", publicName: "maxLength", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { max: "maxChange" }, ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: RangeControl, decorators: [{
            type: Component,
            args: [{ selector: 'range-control', template: '' }]
        }], propDecorators: { min: [{ type: i0.Input, args: [{ isSignal: true, alias: "min", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }, { type: i0.Output, args: ["maxChange"] }], minLength: [{ type: i0.Input, args: [{ isSignal: true, alias: "minLength", required: false }] }], maxLength: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxLength", required: false }] }] } });
export class MyComponent {
    field = 'field';
    minimum = 0;
    maximum = signal(100, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maximum" }] : /* istanbul ignore next */ []));
    length = 5;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <range-control [formField]="field" [min]="minimum" [(max)]="maximum"
      minLength="{{length}}" bind-maxLength="length" />
    <range-control [formField]="field" min="0" [attr.max]="10" />
  `, isInline: true, dependencies: [{ kind: "directive", type: FormField, selector: "[formField]", inputs: ["formField"] }, { kind: "component", type: RangeControl, selector: "range-control", inputs: ["min", "max", "minLength", "maxLength"], outputs: ["maxChange"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <range-control [formField]="field" [min]="minimum" [(max)]="maximum"
      minLength="{{length}}" bind-maxLength="length" />
    <range-control [formField]="field" min="0" [attr.max]="10" />
  `,
                    imports: [FormField, RangeControl],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: constraint_bindings.d.ts
 ****************************************************************************************************/
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

/****************************************************************************************************
 * PARTIAL FILE: radio_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class FormField {
    formField = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "formField" }] : /* istanbul ignore next */ []));
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

