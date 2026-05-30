/****************************************************************************************************
 * PARTIAL FILE: output_in_directive.js
 ****************************************************************************************************/
import { Directive, EventEmitter, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import * as i0 from "@angular/core";
export class TestDir {
    a = output();
    b = output({});
    c = output({ alias: 'cPublic' });
    d = outputFromObservable(new EventEmitter());
    e = outputFromObservable(new EventEmitter());
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, outputs: { a: "a", b: "b", c: "cPublic", d: "d", e: "e" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive,
            args: [{}]
        }], propDecorators: { a: [{ type: i0.Output, args: ["a"] }], b: [{ type: i0.Output, args: ["b"] }], c: [{ type: i0.Output, args: ["cPublic"] }], d: [{ type: i0.Output, args: ["d"] }], e: [{ type: i0.Output, args: ["e"] }] } });

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
    a = output();
    b = output({});
    c = output({ alias: 'cPublic' });
    d = outputFromObservable(new EventEmitter());
    e = outputFromObservable(new EventEmitter());
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestComp, isStandalone: true, selector: "ng-component", outputs: { a: "a", b: "b", c: "cPublic", d: "d", e: "e" }, ngImport: i0, template: 'Works', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestComp, decorators: [{
            type: Component,
            args: [{
                    template: 'Works',
                }]
        }], propDecorators: { a: [{ type: i0.Output, args: ["a"] }], b: [{ type: i0.Output, args: ["b"] }], c: [{ type: i0.Output, args: ["cPublic"] }], d: [{ type: i0.Output, args: ["d"] }], e: [{ type: i0.Output, args: ["e"] }] } });

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
    click1 = output();
    click2 = output();
    click3 = outputFromObservable(new EventEmitter());
    _bla = output({ alias: 'decoratorPublicName' });
    _bla2 = outputFromObservable(new EventEmitter(), { alias: 'decoratorPublicName2' });
    clickDecorator1 = new EventEmitter();
    clickDecorator2 = new EventEmitter();
    _blaDecorator = new EventEmitter();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: TestDir, isStandalone: true, outputs: { click1: "click1", click2: "click2", click3: "click3", _bla: "decoratorPublicName", _bla2: "decoratorPublicName2", clickDecorator1: "clickDecorator1", clickDecorator2: "clickDecorator2", _blaDecorator: "decoratorPublicName3" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestDir, decorators: [{
            type: Directive
        }], propDecorators: { click1: [{ type: i0.Output, args: ["click1"] }], click2: [{ type: i0.Output, args: ["click2"] }], click3: [{ type: i0.Output, args: ["click3"] }], _bla: [{ type: i0.Output, args: ["decoratorPublicName"] }], _bla2: [{ type: i0.Output, args: ["decoratorPublicName2"] }], clickDecorator1: [{
                type: Output
            }], clickDecorator2: [{
                type: Output
            }], _blaDecorator: [{
                type: Output,
                args: ['decoratorPublicName3']
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
    static ɵdir: i0.ɵɵDirectiveDeclaration<TestDir, never, never, {}, { "click1": "click1"; "click2": "click2"; "click3": "click3"; "_bla": "decoratorPublicName"; "_bla2": "decoratorPublicName2"; "clickDecorator1": "clickDecorator1"; "clickDecorator2": "clickDecorator2"; "_blaDecorator": "decoratorPublicName3"; }, never, never, true, never>;
}

