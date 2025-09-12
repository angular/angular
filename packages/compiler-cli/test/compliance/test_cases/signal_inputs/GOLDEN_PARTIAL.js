/****************************************************************************************************
 * PARTIAL FILE: input_directive_definition.js
 ****************************************************************************************************/
import { Directive, input } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    constructor() {
        this.counter = input(0, ...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "counter" }] : []));
        this.name = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "name" }] : []));
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

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
    constructor() {
        this.counter = input(0, ...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "counter" }] : []));
        this.name = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "name" }] : []));
    }
}
TestComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0, template: 'Works', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: 'Works',
                }]
        }] });

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
    constructor() {
        this.counter = input(0, ...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "counter" }] : []));
        this.signalWithTransform = input(false, ...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "signalWithTransform", transform: convertToBoolean }] : [{ transform: convertToBoolean }]));
        this.signalWithTransformAndAlias = input(false, ...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "signalWithTransformAndAlias", alias: 'publicNameSignal', transform: convertToBoolean }] : [{ alias: 'publicNameSignal', transform: convertToBoolean }]));
        this.decoratorInput = true;
        this.decoratorInputWithAlias = true;
        this.decoratorInputWithTransformAndAlias = true;
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, signalWithTransform: { classPropertyName: "signalWithTransform", publicName: "signalWithTransform", isSignal: true, isRequired: false, transformFunction: null }, signalWithTransformAndAlias: { classPropertyName: "signalWithTransformAndAlias", publicName: "publicNameSignal", isSignal: true, isRequired: false, transformFunction: null }, decoratorInput: { classPropertyName: "decoratorInput", publicName: "decoratorInput", isSignal: false, isRequired: false, transformFunction: null }, decoratorInputWithAlias: { classPropertyName: "decoratorInputWithAlias", publicName: "publicNameDecorator", isSignal: false, isRequired: false, transformFunction: null }, decoratorInputWithTransformAndAlias: { classPropertyName: "decoratorInputWithTransformAndAlias", publicName: "publicNameDecorator2", isSignal: false, isRequired: false, transformFunction: convertToBoolean } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { decoratorInput: [{
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
    constructor() {
        this.name = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "name", transform: convertToBoolean }] : [{
                transform: convertToBoolean,
            }]));
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

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
    constructor() {
        this.name = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "name", transform: (v) => v === true || v !== '' }] : [{
                transform: (v) => v === true || v !== '',
            }]));
        this.name2 = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "name2", transform: toBoolean }] : [{ transform: toBoolean }]));
        this.genericTransform = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "genericTransform", transform: complexTransform(1) }] : [{ transform: complexTransform(1) }]));
        this.genericTransform2 = input.required(...((typeof ngDevMode === 'undefined' || ngDevMode) ? [{ debugName: "genericTransform2", transform: complexTransform(null) }] : [{ transform: complexTransform(null) }]));
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, name2: { classPropertyName: "name2", publicName: "name2", isSignal: true, isRequired: true, transformFunction: null }, genericTransform: { classPropertyName: "genericTransform", publicName: "genericTransform", isSignal: true, isRequired: true, transformFunction: null }, genericTransform2: { classPropertyName: "genericTransform2", publicName: "genericTransform2", isSignal: true, isRequired: true, transformFunction: null } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

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

