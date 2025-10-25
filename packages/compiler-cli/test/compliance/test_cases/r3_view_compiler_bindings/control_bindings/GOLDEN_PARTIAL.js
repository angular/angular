/****************************************************************************************************
 * PARTIAL FILE: control_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class Field {
    constructor() {
        this.field = input(...(ngDevMode ? [undefined, { debugName: "field" }] : []));
    }
}
Field.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Field, deps: [], target: i0.ɵɵFactoryTarget.Directive });
Field.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: Field, isStandalone: true, selector: "[field]", inputs: { field: { classPropertyName: "field", publicName: "field", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Field, decorators: [{
            type: Directive,
            args: [{ selector: '[field]' }]
        }], propDecorators: { field: [{ type: i0.Input, args: [{ isSignal: true, alias: "field", required: false }] }] } });
export class MyComponent {
    constructor() {
        this.value = 'Hello, world!';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div field="Not a form control"></div>
    <div [attr.field]="value">Not a form control either.</div>
    <input [field]="value">
  `, isInline: true, dependencies: [{ kind: "directive", type: Field, selector: "[field]", inputs: ["field"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div field="Not a form control"></div>
    <div [attr.field]="value">Not a form control either.</div>
    <input [field]="value">
  `,
                    imports: [Field],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: control_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Field {
    readonly field: import("@angular/core").InputSignal<string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Field, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Field, "[field]", never, { "field": { "alias": "field"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export declare class MyComponent {
    value: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

