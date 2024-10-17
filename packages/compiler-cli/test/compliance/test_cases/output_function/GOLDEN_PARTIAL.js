/****************************************************************************************************
 * PARTIAL FILE: output_in_directive.js
 ****************************************************************************************************/
import { Directive, EventEmitter, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import * as i0 from "@angular/core";
export class TestDir {
    constructor() {
        this.a = output();
        this.b = output({});
        this.c = output({ alias: 'cPublic' });
        this.d = outputFromObservable(new EventEmitter());
        this.e = outputFromObservable(new EventEmitter());
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, outputs: { a: "a", b: "b", c: "cPublic", d: "d", e: "e" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: output_in_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestDir {
    a: import("@angular/core").OutputEmitterRef<void>;
    b: import("@angular/core").OutputEmitterRef<string>;
    c: import("@angular/core").OutputEmitterRef<void>;
    d: import("@angular/core").OutputRef<unknown>;
    e: import("@angular/core").OutputRef<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, { "a": "a"; "b": "b"; "c": "cPublic"; "d": "d"; "e": "e"; }, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: output_in_component.js
 ****************************************************************************************************/
import { Component, EventEmitter, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import * as i0 from "@angular/core";
export class TestComp {
    constructor() {
        this.a = output();
        this.b = output({});
        this.c = output({ alias: 'cPublic' });
        this.d = outputFromObservable(new EventEmitter());
        this.e = outputFromObservable(new EventEmitter());
    }
}
TestComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", outputs: { a: "a", b: "b", c: "cPublic", d: "d", e: "e" }, ngImport: i0, template: 'Works', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: 'Works',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: output_in_component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestComp {
    a: import("@angular/core").OutputEmitterRef<void>;
    b: import("@angular/core").OutputEmitterRef<string>;
    c: import("@angular/core").OutputEmitterRef<void>;
    d: import("@angular/core").OutputRef<unknown>;
    e: import("@angular/core").OutputRef<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestComp, "ng-component", never, {}, { "a": "a"; "b": "b"; "c": "cPublic"; "d": "d"; "e": "e"; }, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: mixed_variants.js
 ****************************************************************************************************/
import { Directive, EventEmitter, Output, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import * as i0 from "@angular/core";
export class TestDir {
    constructor() {
        this.click1 = output();
        this.click2 = output();
        this.click3 = outputFromObservable(new EventEmitter());
        this._bla = output({ alias: 'decoratorPublicName' });
        this._bla2 = outputFromObservable(new EventEmitter(), { alias: 'decoratorPublicName2' });
        this.clickDecorator1 = new EventEmitter();
        this.clickDecorator2 = new EventEmitter();
        this._blaDecorator = new EventEmitter();
    }
}
TestDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
TestDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, outputs: { click1: "click1", click2: "click2", click3: "click3", _bla: "decoratorPublicName", _bla2: "decoratorPublicName2", clickDecorator1: "clickDecorator1", clickDecorator2: "clickDecorator2", _blaDecorator: "decoratorPublicName" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                }]
        }], propDecorators: { clickDecorator1: [{
                type: Output
            }], clickDecorator2: [{
                type: Output
            }], _blaDecorator: [{
                type: Output,
                args: ['decoratorPublicName']
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: mixed_variants.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class TestDir {
    click1: import("@angular/core").OutputEmitterRef<void>;
    click2: import("@angular/core").OutputEmitterRef<boolean>;
    click3: import("@angular/core").OutputRef<unknown>;
    _bla: import("@angular/core").OutputEmitterRef<void>;
    _bla2: import("@angular/core").OutputRef<unknown>;
    clickDecorator1: EventEmitter<any>;
    clickDecorator2: EventEmitter<boolean>;
    _blaDecorator: EventEmitter<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, { "click1": "click1"; "click2": "click2"; "click3": "click3"; "_bla": "decoratorPublicName"; "_bla2": "decoratorPublicName2"; "clickDecorator1": "clickDecorator1"; "clickDecorator2": "clickDecorator2"; "_blaDecorator": "decoratorPublicName"; }, never, never, true, never>;
}

