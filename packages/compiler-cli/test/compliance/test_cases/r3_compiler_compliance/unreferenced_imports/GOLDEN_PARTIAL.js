/****************************************************************************************************
 * PARTIAL FILE: deps.js
 ****************************************************************************************************/
export class Dep {
}
export class OtherDep {
}
export var nested;
(function (nested) {
    class DeepDep {
    }
    nested.DeepDep = DeepDep;
})(nested || (nested = {}));
export class Model {
}
export class Registered {
}
export class Fallback {
}
export class Box {
    value;
}
export function Custom() {
    return () => { };
}

/****************************************************************************************************
 * PARTIAL FILE: deps.d.ts
 ****************************************************************************************************/
export declare class Dep {
}
export declare class OtherDep {
}
export declare namespace nested {
    class DeepDep {
    }
}
export declare class Model {
}
export declare class Registered {
}
export declare class Fallback {
}
export declare class Box<T> {
    value: T;
}
export declare function Custom(): PropertyDecorator;

/****************************************************************************************************
 * PARTIAL FILE: unreferenced_imports.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewChild, ViewChildren } from '@angular/core';
import { Box, Custom, Dep, Fallback, OtherDep, Registered } from './deps';
import * as i0 from "@angular/core";
export class MyCmp {
    // The types below are only referenced by the metadata of decorators that are removed.
    el;
    els;
    model;
    // The metadata of a decorator that is not removed still refers to the type.
    dep;
    // A type that is also used as a value is still referenced.
    box;
    other;
    registered;
    fallback;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyCmp, isStandalone: true, selector: "my-cmp", inputs: { model: "model", dep: "dep", box: "box", other: "other", registered: "registered", fallback: "fallback" }, viewQueries: [{ propertyName: "el", first: true, predicate: ["el"], descendants: true }, { propertyName: "els", predicate: ["el"], descendants: true }], ngImport: i0, template: '<div #el></div>', isInline: true });
}
__decorate([
    Custom(),
    __metadata("design:type", Dep)
], MyCmp.prototype, "dep", void 0);
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyCmp, decorators: [{
            type: Component,
            args: [{ selector: 'my-cmp', template: '<div #el></div>' }]
        }], propDecorators: { el: [{
                type: ViewChild,
                args: ['el']
            }], els: [{
                type: ViewChildren,
                args: ['el']
            }], model: [{
                type: Input
            }], dep: [{
                type: Input
            }], box: [{
                type: Input
            }], other: [{
                type: Input
            }], registered: [{
                type: Input
            }], fallback: [{
                type: Input
            }] } });
export const NumberBox = (Box);
export const registry = { Registered };
export function valueOf(options) {
    let value;
    ({ value = Fallback } = options);
    return value;
}
export { OtherDep };

/****************************************************************************************************
 * PARTIAL FILE: unreferenced_imports.d.ts
 ****************************************************************************************************/
import { ElementRef, QueryList } from '@angular/core';
import { Box, Dep, Fallback, Model, OtherDep, Registered } from './deps';
import * as i0 from "@angular/core";
export declare class MyCmp {
    el: ElementRef;
    els: QueryList<ElementRef>;
    model: Model;
    dep: Dep;
    box: Box<number>;
    other: OtherDep;
    registered: Registered;
    fallback: Fallback;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyCmp, "my-cmp", never, { "model": { "alias": "model"; "required": false; }; "dep": { "alias": "dep"; "required": false; }; "box": { "alias": "box"; "required": false; }; "other": { "alias": "other"; "required": false; }; "registered": { "alias": "registered"; "required": false; }; "fallback": { "alias": "fallback"; "required": false; }; }, {}, never, never, true, never>;
}
export declare const NumberBox: {
    new (): Box<number>;
};
export declare const registry: {
    Registered: typeof Registered;
};
export declare function valueOf(options: {
    value?: unknown;
}): unknown;
export { OtherDep };

