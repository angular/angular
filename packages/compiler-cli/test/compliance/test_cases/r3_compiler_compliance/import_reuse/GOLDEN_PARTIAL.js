/****************************************************************************************************
 * PARTIAL FILE: default_dep.js
 ****************************************************************************************************/
export default class DefaultDep {
}

/****************************************************************************************************
 * PARTIAL FILE: default_dep.d.ts
 ****************************************************************************************************/
export default class DefaultDep {
}

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
 * PARTIAL FILE: constructor_di.js
 ****************************************************************************************************/
import { Directive, ElementRef, Injectable, Pipe, TemplateRef } from '@angular/core';
import DefaultDep from './default_dep';
import { Dep, OtherDep as AliasedDep } from './deps';
import * as deps from './deps';
import * as i0 from "@angular/core";
export class MyService {
    constructor(dep, aliased, member, nestedMember, defaultDep) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [{ token: Dep }, { token: AliasedDep }, { token: deps.Dep }, { token: deps.nested.DeepDep }, { token: DefaultDep }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: Dep }, { type: AliasedDep }, { type: deps.Dep }, { type: deps.nested.DeepDep }, { type: DefaultDep }] });
export class MyDir {
    constructor(el, template, dep) { }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDir, deps: [{ token: ElementRef }, { token: TemplateRef }, { token: Dep }], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: MyDir, isStandalone: true, selector: "[myDir]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyDir, decorators: [{
            type: Directive,
            args: [{ selector: '[myDir]' }]
        }], ctorParameters: () => [{ type: ElementRef }, { type: TemplateRef }, { type: Dep }] });
export class MyPipe {
    constructor(dep) { }
    transform(value) {
        return value;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [{ token: Dep }], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, isStandalone: true, name: "myPipe" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'myPipe' }]
        }], ctorParameters: () => [{ type: Dep }] });

/****************************************************************************************************
 * PARTIAL FILE: constructor_di.d.ts
 ****************************************************************************************************/
import { ElementRef, PipeTransform, TemplateRef } from '@angular/core';
import DefaultDep from './default_dep';
import { Dep, OtherDep as AliasedDep } from './deps';
import * as deps from './deps';
import * as i0 from "@angular/core";
export declare class MyService {
    constructor(dep: Dep, aliased: AliasedDep, member: deps.Dep, nestedMember: deps.nested.DeepDep, defaultDep: DefaultDep);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}
export declare class MyDir {
    constructor(el: ElementRef, template: TemplateRef<unknown>, dep: Dep);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<MyDir, "[myDir]", never, {}, {}, never, never, true, never>;
}
export declare class MyPipe implements PipeTransform {
    constructor(dep: Dep);
    transform(value: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe", true>;
}

/****************************************************************************************************
 * PARTIAL FILE: directives.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class HostDir {
    label = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostDir, isStandalone: true, selector: "[hostDir]", inputs: { label: "label" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostDir]' }]
        }], propDecorators: { label: [{
                type: Input
            }] } });
export class OtherHostDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherHostDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OtherHostDir, isStandalone: true, selector: "[otherHostDir]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherHostDir, decorators: [{
            type: Directive,
            args: [{ selector: '[otherHostDir]' }]
        }] });
export class Badge {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Badge, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Badge, isStandalone: true, selector: "badge", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Badge, decorators: [{
            type: Component,
            args: [{ selector: 'badge', template: '' }]
        }] });
export function toNumber(value) {
    return Number(value);
}

/****************************************************************************************************
 * PARTIAL FILE: directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostDir {
    label: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[hostDir]", never, { "label": { "alias": "label"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class OtherHostDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherHostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<OtherHostDir, "[otherHostDir]", never, {}, {}, never, never, true, never>;
}
export declare class Badge {
    static ɵfac: i0.ɵɵFactoryDeclaration<Badge, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Badge, "badge", never, {}, {}, never, never, true, never>;
}
export declare function toNumber(value: string | number): number;

/****************************************************************************************************
 * PARTIAL FILE: host_directives.js
 ****************************************************************************************************/
import { Component, forwardRef } from '@angular/core';
import { HostDir, OtherHostDir as AliasedHostDir } from './directives';
import * as directives from './directives';
import * as i0 from "@angular/core";
export class HostCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostCmp, isStandalone: true, selector: "host-cmp", hostDirectives: [{ directive: HostDir }, { directive: AliasedHostDir }], ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'host-cmp',
                    template: '',
                    hostDirectives: [HostDir, AliasedHostDir],
                }]
        }] });
export class NamespaceHostCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NamespaceHostCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: NamespaceHostCmp, isStandalone: true, selector: "namespace-host-cmp", hostDirectives: [{ directive: directives.HostDir, inputs: ["label", "label"] }, { directive: i0.forwardRef(() => directives.OtherHostDir) }], ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: NamespaceHostCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'namespace-host-cmp',
                    template: '',
                    hostDirectives: [
                        { directive: directives.HostDir, inputs: ['label'] },
                        forwardRef(() => directives.OtherHostDir),
                    ],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: host_directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
import * as i1 from "./directives";
export declare class HostCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<HostCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<HostCmp, "host-cmp", never, {}, {}, never, never, true, [{ directive: typeof i1.HostDir; inputs: {}; outputs: {}; }, { directive: typeof i1.OtherHostDir; inputs: {}; outputs: {}; }]>;
}
export declare class NamespaceHostCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<NamespaceHostCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NamespaceHostCmp, "namespace-host-cmp", never, {}, {}, never, never, true, [{ directive: typeof i1.HostDir; inputs: { "label": "label"; }; outputs: {}; }, { directive: typeof i1.OtherHostDir; inputs: {}; outputs: {}; }]>;
}

/****************************************************************************************************
 * PARTIAL FILE: directives.js
 ****************************************************************************************************/
import { Component, Directive, Input } from '@angular/core';
import * as i0 from "@angular/core";
export class HostDir {
    label = '';
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: HostDir, isStandalone: true, selector: "[hostDir]", inputs: { label: "label" }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: HostDir, decorators: [{
            type: Directive,
            args: [{ selector: '[hostDir]' }]
        }], propDecorators: { label: [{
                type: Input
            }] } });
export class OtherHostDir {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherHostDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OtherHostDir, isStandalone: true, selector: "[otherHostDir]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherHostDir, decorators: [{
            type: Directive,
            args: [{ selector: '[otherHostDir]' }]
        }] });
export class Badge {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Badge, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Badge, isStandalone: true, selector: "badge", ngImport: i0, template: '', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Badge, decorators: [{
            type: Component,
            args: [{ selector: 'badge', template: '' }]
        }] });
export function toNumber(value) {
    return Number(value);
}

/****************************************************************************************************
 * PARTIAL FILE: directives.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostDir {
    label: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<HostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<HostDir, "[hostDir]", never, { "label": { "alias": "label"; "required": false; }; }, {}, never, never, true, never>;
}
export declare class OtherHostDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherHostDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<OtherHostDir, "[otherHostDir]", never, {}, {}, never, never, true, never>;
}
export declare class Badge {
    static ɵfac: i0.ɵɵFactoryDeclaration<Badge, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Badge, "badge", never, {}, {}, never, never, true, never>;
}
export declare function toNumber(value: string | number): number;

/****************************************************************************************************
 * PARTIAL FILE: namespace_references.js
 ****************************************************************************************************/
import { Component, Input } from '@angular/core';
import * as directives from './directives';
import * as i0 from "@angular/core";
export class MyCmp {
    count = 0;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "0.0.0-PLACEHOLDER", type: MyCmp, isStandalone: true, selector: "my-cmp", inputs: { count: ["count", "count", directives.toNumber] }, ngImport: i0, template: '<badge />', isInline: true, dependencies: [{ kind: "component", type: directives.Badge, selector: "badge" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyCmp, decorators: [{
            type: Component,
            args: [{
                    selector: 'my-cmp',
                    template: '<badge />',
                    imports: [directives.Badge],
                }]
        }], propDecorators: { count: [{
                type: Input,
                args: [{ transform: directives.toNumber }]
            }] } });

/****************************************************************************************************
 * PARTIAL FILE: namespace_references.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyCmp {
    count: number;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyCmp, "my-cmp", never, { "count": { "alias": "count"; "required": false; }; }, {}, never, never, true, never>;
    static ngAcceptInputType_count: string | number;
}

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

