/****************************************************************************************************
 * PARTIAL FILE: input_directive_definition.js
 ****************************************************************************************************/
import { Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    counter = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ []));
    name = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { counter: [{ type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] } });

/****************************************************************************************************
 * PARTIAL FILE: input_directive_definition.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    counter: import("@angular/core").InputSignal<number>;
    name: import("@angular/core").InputSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: input_component_definition.js
 ****************************************************************************************************/
import { Component, input } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    counter = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ []));
    name = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "name" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: 'Works', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: 'Works',
                }]
        }], propDecorators: { counter: [{ type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] }], name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] } });

/****************************************************************************************************
 * PARTIAL FILE: input_component_definition.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    counter: import("@angular/core").InputSignal<number>;
    name: import("@angular/core").InputSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: mixed_input_types.js
 ****************************************************************************************************/
import { Directive, Input, input } from '@angular/core';
import * as i0 from "@angular/core";
function convertToBoolean(value) {
    return value === true || value !== '';
}
export class TestDir {
    counter = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "counter" }] : /* istanbul ignore next */ []));
    signalWithTransform = input(false, { ...(ngDevMode ? { debugName: "signalWithTransform" } : /* istanbul ignore next */ {}), transform: convertToBoolean });
    signalWithTransformAndAlias = input(false, { ...(ngDevMode ? { debugName: "signalWithTransformAndAlias" } : /* istanbul ignore next */ {}), alias: 'publicNameSignal', transform: convertToBoolean });
    decoratorInput = true;
    decoratorInputWithAlias = true;
    decoratorInputWithTransformAndAlias = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, signalWithTransform: { classPropertyName: "signalWithTransform", publicName: "signalWithTransform", isSignal: true, isRequired: false, transformFunction: null }, signalWithTransformAndAlias: { classPropertyName: "signalWithTransformAndAlias", publicName: "publicNameSignal", isSignal: true, isRequired: false, transformFunction: null }, decoratorInput: { classPropertyName: "decoratorInput", publicName: "decoratorInput", isSignal: false, isRequired: false, transformFunction: null }, decoratorInputWithAlias: { classPropertyName: "decoratorInputWithAlias", publicName: "publicNameDecorator", isSignal: false, isRequired: false, transformFunction: null }, decoratorInputWithTransformAndAlias: { classPropertyName: "decoratorInputWithTransformAndAlias", publicName: "publicNameDecorator2", isSignal: false, isRequired: false, transformFunction: convertToBoolean } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { counter: [{ type: i0.Input, args: [{ isSignal: true, alias: "counter", required: false }] }], signalWithTransform: [{ type: i0.Input, args: [{ isSignal: true, alias: "signalWithTransform", required: false }] }], signalWithTransformAndAlias: [{ type: i0.Input, args: [{ isSignal: true, alias: "publicNameSignal", required: false }] }], decoratorInput: [{
                type: Input
            }], decoratorInputWithAlias: [{
                type: Input,
                args: ['publicNameDecorator']
            }], decoratorInputWithTransformAndAlias: [{
                type: Input,
                args: [{ alias: 'publicNameDecorator2', transform: convertToBoolean }]
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: mixed_input_types.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    counter: import("@angular/core").InputSignal<number>;
    signalWithTransform: import("@angular/core").InputSignalWithTransform<boolean, string | boolean>;
    signalWithTransformAndAlias: import("@angular/core").InputSignalWithTransform<boolean, string | boolean>;
    decoratorInput: boolean;
    decoratorInputWithAlias: boolean;
    decoratorInputWithTransformAndAlias: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "signalWithTransform": { "alias": "signalWithTransform"; "required": false; "isSignal": true; }; "signalWithTransformAndAlias": { "alias": "publicNameSignal"; "required": false; "isSignal": true; }; "decoratorInput": { "alias": "decoratorInput"; "required": false; }; "decoratorInputWithAlias": { "alias": "publicNameDecorator"; "required": false; }; "decoratorInputWithTransformAndAlias": { "alias": "publicNameDecorator2"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_decoratorInputWithTransformAndAlias: string | boolean;
}

/****************************************************************************************************
 * PARTIAL FILE: transform_not_captured.js
 ****************************************************************************************************/
import { Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
function convertToBoolean(value) {
    return value === true || value !== '';
}
export class TestDir {
    name = input.required({ ...(ngDevMode ? { debugName: "name" } : /* istanbul ignore next */ {}), transform: convertToBoolean });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }] } });

/****************************************************************************************************
 * PARTIAL FILE: transform_not_captured.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    name: import("@angular/core").InputSignalWithTransform<boolean, string | boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: complex_transform_functions.js
 ****************************************************************************************************/
import { Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
// Note: `@Input` non-signal inputs did not support arrow functions as an example.
const toBoolean = (v) => v === true || v !== '';
// Note: `@Input` non-signal inputs did not support transform function "builders" and generics.
const complexTransform = (defaultVal) => (v) => v || defaultVal;
export class TestDir {
    name = input.required({ ...(ngDevMode ? { debugName: "name" } : /* istanbul ignore next */ {}), transform: (v) => v === true || v !== '' });
    name2 = input.required({ ...(ngDevMode ? { debugName: "name2" } : /* istanbul ignore next */ {}), transform: toBoolean });
    genericTransform = input.required({ ...(ngDevMode ? { debugName: "genericTransform" } : /* istanbul ignore next */ {}), transform: complexTransform(1) });
    genericTransform2 = input.required({ ...(ngDevMode ? { debugName: "genericTransform2" } : /* istanbul ignore next */ {}), transform: complexTransform(null) });
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, name2: { classPropertyName: "name2", publicName: "name2", isSignal: true, isRequired: true, transformFunction: null }, genericTransform: { classPropertyName: "genericTransform", publicName: "genericTransform", isSignal: true, isRequired: true, transformFunction: null }, genericTransform2: { classPropertyName: "genericTransform2", publicName: "genericTransform2", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }], name2: [{ type: i0.Input, args: [{ isSignal: true, alias: "name2", required: true }] }], genericTransform: [{ type: i0.Input, args: [{ isSignal: true, alias: "genericTransform", required: true }] }], genericTransform2: [{ type: i0.Input, args: [{ isSignal: true, alias: "genericTransform2", required: true }] }] } });

/****************************************************************************************************
 * PARTIAL FILE: complex_transform_functions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    name: import("@angular/core").InputSignalWithTransform<boolean, string | boolean>;
    name2: import("@angular/core").InputSignalWithTransform<boolean, string | boolean>;
    genericTransform: import("@angular/core").InputSignalWithTransform<string | number, string>;
    genericTransform2: import("@angular/core").InputSignalWithTransform<string | null, string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; "name2": { "alias": "name2"; "required": true; "isSignal": true; }; "genericTransform": { "alias": "genericTransform"; "required": true; "isSignal": true; }; "genericTransform2": { "alias": "genericTransform2"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: signal_apis.js
 ****************************************************************************************************/
import { booleanAttribute, Directive, input, model, output } from '@angular/core';
import * as i0 from "@angular/core";
export class SignalApisDirective {
    // Signal input, required signal input, aliased + transformed input.
    value = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    id = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "id" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), alias: 'isDisabled', transform: booleanAttribute });
    // Two-way model and an event output.
    checked = model(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "checked" }] : /* istanbul ignore next */ []));
    changed = output();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SignalApisDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: SignalApisDirective, isStandalone: true, selector: "[signalApis]", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, id: { classPropertyName: "id", publicName: "id", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "isDisabled", isSignal: true, isRequired: false, transformFunction: null }, checked: { classPropertyName: "checked", publicName: "checked", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { checked: "checkedChange", changed: "changed" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SignalApisDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[signalApis]',
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }], id: [{ type: i0.Input, args: [{ isSignal: true, alias: "id", required: true }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "isDisabled", required: false }] }], checked: [{ type: i0.Input, args: [{ isSignal: true, alias: "checked", required: false }] }, { type: i0.Output, args: ["checkedChange"] }], changed: [{ type: i0.Output, args: ["changed"] }] } });

/****************************************************************************************************
 * PARTIAL FILE: signal_apis.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SignalApisDirective {
    value: import("@angular/core").InputSignal<string>;
    id: import("@angular/core").InputSignal<string>;
    disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    checked: import("@angular/core").ModelSignal<boolean>;
    changed: import("@angular/core").OutputEmitterRef<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SignalApisDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SignalApisDirective, "[signalApis]", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "id": { "alias": "id"; "required": true; "isSignal": true; }; "disabled": { "alias": "isDisabled"; "required": false; "isSignal": true; }; "checked": { "alias": "checked"; "required": false; "isSignal": true; }; }, { "checked": "checkedChange"; "changed": "changed"; }, never, never, true, never>;
}

