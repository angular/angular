/****************************************************************************************************
 * PARTIAL FILE: model_directive_definition.js
 ****************************************************************************************************/
import { Directive, model } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    constructor() {
        this.counter = model(0, ...(ngDevMode ? [{ debugName: "counter" }] : []));
        this.name = model.required(...(ngDevMode ? [{ debugName: "name" }] : []));
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { counter: "counterChange", name: "nameChange" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: model_directive_definition.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    counter: import("@angular/core").ModelSignal<number>;
    name: import("@angular/core").ModelSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, { "counter": "counterChange"; "name": "nameChange"; }, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: model_component_definition.js
 ****************************************************************************************************/
import { Component, model } from '@angular/core';
import * as i0 from "@angular/core";
export class TestComp {
    constructor() {
        this.counter = model(0, ...(ngDevMode ? [{ debugName: "counter" }] : []));
        this.name = model.required(...(ngDevMode ? [{ debugName: "name" }] : []));
    }
}
TestComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { counter: "counterChange", name: "nameChange" }, ngImport: i0, template: 'Works', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: 'Works',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: model_component_definition.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    counter: import("@angular/core").ModelSignal<number>;
    name: import("@angular/core").ModelSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "name": { "alias": "name"; "required": true; "isSignal": true; }; }, { "counter": "counterChange"; "name": "nameChange"; }, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: mixed_model_types.js
 ****************************************************************************************************/
import { Directive, EventEmitter, Input, model, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class TestDir {
    constructor() {
        this.counter = model(0, ...(ngDevMode ? [{ debugName: "counter" }] : []));
        this.modelWithAlias = model(false, ...(ngDevMode ? [{ debugName: "modelWithAlias", alias: 'alias' }] : [{ alias: 'alias' }]));
        this.decoratorInput = true;
        this.decoratorInputWithAlias = true;
        this.decoratorOutput = new EventEmitter();
        this.decoratorOutputWithAlias = new EventEmitter();
        this.decoratorInputTwoWay = true;
        this.decoratorInputTwoWayChange = new EventEmitter();
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, inputs: { counter: { classPropertyName: "counter", publicName: "counter", isSignal: true, isRequired: false, transformFunction: null }, modelWithAlias: { classPropertyName: "modelWithAlias", publicName: "alias", isSignal: true, isRequired: false, transformFunction: null }, decoratorInput: { classPropertyName: "decoratorInput", publicName: "decoratorInput", isSignal: false, isRequired: false, transformFunction: null }, decoratorInputWithAlias: { classPropertyName: "decoratorInputWithAlias", publicName: "publicNameDecorator", isSignal: false, isRequired: false, transformFunction: null }, decoratorInputTwoWay: { classPropertyName: "decoratorInputTwoWay", publicName: "decoratorInputTwoWay", isSignal: false, isRequired: false, transformFunction: null } }, outputs: { counter: "counterChange", modelWithAlias: "aliasChange", decoratorOutput: "decoratorOutput", decoratorOutputWithAlias: "aliasDecoratorOutputWithAlias", decoratorInputTwoWayChange: "decoratorInputTwoWayChange" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { decoratorInput: [{
                type: Input
            }], decoratorInputWithAlias: [{
                type: Input,
                args: ['publicNameDecorator']
            }], decoratorOutput: [{
                type: Output
            }], decoratorOutputWithAlias: [{
                type: Output,
                args: ['aliasDecoratorOutputWithAlias']
            }], decoratorInputTwoWay: [{
                type: Input
            }], decoratorInputTwoWayChange: [{
                type: Output
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: mixed_model_types.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestDir {
    counter: import("@angular/core").ModelSignal<number>;
    modelWithAlias: import("@angular/core").ModelSignal<boolean>;
    decoratorInput: boolean;
    decoratorInputWithAlias: boolean;
    decoratorOutput: EventEmitter<boolean>;
    decoratorOutputWithAlias: EventEmitter<boolean>;
    decoratorInputTwoWay: boolean;
    decoratorInputTwoWayChange: EventEmitter<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, { "counter": { "alias": "counter"; "required": false; "isSignal": true; }; "modelWithAlias": { "alias": "alias"; "required": false; "isSignal": true; }; "decoratorInput": { "alias": "decoratorInput"; "required": false; }; "decoratorInputWithAlias": { "alias": "publicNameDecorator"; "required": false; }; "decoratorInputTwoWay": { "alias": "decoratorInputTwoWay"; "required": false; }; }, { "counter": "counterChange"; "modelWithAlias": "aliasChange"; "decoratorOutput": "decoratorOutput"; "decoratorOutputWithAlias": "aliasDecoratorOutputWithAlias"; "decoratorInputTwoWayChange": "decoratorInputTwoWayChange"; }, never, never, true, never>;
}

