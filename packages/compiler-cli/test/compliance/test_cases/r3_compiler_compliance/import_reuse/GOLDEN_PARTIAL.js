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

