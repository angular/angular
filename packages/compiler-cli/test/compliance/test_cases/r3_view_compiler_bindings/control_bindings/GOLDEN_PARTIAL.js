/****************************************************************************************************
 * PARTIAL FILE: control_bindings.js
 ****************************************************************************************************/
import { Component, Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class Control {
    constructor() {
        this.control = input(...(ngDevMode ? [undefined, { debugName: "control" }] : []));
    }
}
Control.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Control, deps: [], target: i0.ɵɵFactoryTarget.Directive });
Control.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: Control, isStandalone: true, selector: "[control]", inputs: { control: { classPropertyName: "control", publicName: "control", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Control, decorators: [{
            type: Directive,
            args: [{ selector: '[control]' }]
        }], propDecorators: { control: [{ type: i0.Input, args: [{ isSignal: true, alias: "control", required: false }] }] } });
export class MyComponent {
    constructor() {
        this.value = 'Hello, world!';
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, isStandalone: true, selector: "ng-component", ngImport: i0, template: `
    <div control="Not a form control"></div>
    <div [attr.control]="value">Not a form control either.</div>
    <input [control]="value">
  `, isInline: true, dependencies: [{ kind: "directive", type: Control, selector: "[control]", inputs: ["control"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{
                    template: `
    <div control="Not a form control"></div>
    <div [attr.control]="value">Not a form control either.</div>
    <input [control]="value">
  `,
                    imports: [Control],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: control_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Control {
    readonly control: import("@angular/core").InputSignal<string | undefined>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Control, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<Control, "[control]", never, { "control": { "alias": "control"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export declare class MyComponent {
    value: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never, true, never>;
}

