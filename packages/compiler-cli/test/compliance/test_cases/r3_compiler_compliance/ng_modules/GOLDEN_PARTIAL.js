/****************************************************************************************************
 * PARTIAL FILE: basic.js
 ****************************************************************************************************/
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import * as i0 from "@angular/core";
export class BasicModule {
}
BasicModule.ɵfac = function BasicModule_Factory(t) { return new (t || BasicModule)(); };
BasicModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule, id: 'BasicModuleId' });
BasicModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BasicModule, [{
        type: NgModule,
        args: [{ id: 'BasicModuleId', schemas: [NO_ERRORS_SCHEMA] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: basic.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class BasicModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BasicModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDef<BasicModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: declarations.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class FooComponent {
    constructor() {
        this.name = 'World';
    }
}
FooComponent.ɵfac = function FooComponent_Factory(t) { return new (t || FooComponent)(); };
FooComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: FooComponent, selector: "foo", ngImport: i0, template: '<div>Hello, {{name}}!</div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooComponent, [{
        type: Component,
        args: [{ selector: 'foo', template: '<div>Hello, {{name}}!</div>' }]
    }], null, null); })();
export class BarDirective {
}
BarDirective.ɵfac = function BarDirective_Factory(t) { return new (t || BarDirective)(); };
BarDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: BarDirective, selector: "[bar]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BarDirective, [{
        type: Directive,
        args: [{ selector: '[bar]' }]
    }], null, null); })();
export class QuxPipe {
    transform() { }
}
QuxPipe.ɵfac = function QuxPipe_Factory(t) { return new (t || QuxPipe)(); };
QuxPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, name: "qux" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(QuxPipe, [{
        type: Pipe,
        args: [{ name: 'qux' }]
    }], null, null); })();
export class FooModule {
}
FooModule.ɵfac = function FooModule_Factory(t) { return new (t || FooModule)(); };
FooModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, bootstrap: [FooComponent], declarations: [FooComponent, BarDirective, QuxPipe] });
FooModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooModule, [{
        type: NgModule,
        args: [{ declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: declarations.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class FooComponent {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FooComponent, "foo", never, {}, {}, never, never>;
}
export declare class BarDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<BarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BarDirective, "[bar]", never, {}, {}, never>;
}
export declare class QuxPipe implements PipeTransform {
    transform(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuxPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<QuxPipe, "qux">;
}
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, [typeof FooComponent, typeof BarDirective, typeof QuxPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: declarations_jit_mode.js
 ****************************************************************************************************/
import { Component, Directive, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class FooComponent {
    constructor() {
        this.name = 'World';
    }
}
FooComponent.ɵfac = function FooComponent_Factory(t) { return new (t || FooComponent)(); };
FooComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: FooComponent, selector: "foo", ngImport: i0, template: '<div>Hello, {{name}}!</div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooComponent, [{
        type: Component,
        args: [{ selector: 'foo', template: '<div>Hello, {{name}}!</div>' }]
    }], null, null); })();
export class BarDirective {
}
BarDirective.ɵfac = function BarDirective_Factory(t) { return new (t || BarDirective)(); };
BarDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: BarDirective, selector: "[bar]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BarDirective, [{
        type: Directive,
        args: [{ selector: '[bar]' }]
    }], null, null); })();
export class QuxPipe {
    transform() { }
}
QuxPipe.ɵfac = function QuxPipe_Factory(t) { return new (t || QuxPipe)(); };
QuxPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: QuxPipe, name: "qux" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(QuxPipe, [{
        type: Pipe,
        args: [{ name: 'qux' }]
    }], null, null); })();
export class FooModule {
}
FooModule.ɵfac = function FooModule_Factory(t) { return new (t || FooModule)(); };
FooModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, bootstrap: [FooComponent], declarations: [FooComponent, BarDirective, QuxPipe] });
FooModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooModule, [{
        type: NgModule,
        args: [{ declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: declarations_jit_mode.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
export declare class FooComponent {
    name: string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FooComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FooComponent, "foo", never, {}, {}, never, never>;
}
export declare class BarDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<BarDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<BarDirective, "[bar]", never, {}, {}, never>;
}
export declare class QuxPipe implements PipeTransform {
    transform(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuxPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<QuxPipe, "qux">;
}
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, [typeof FooComponent, typeof BarDirective, typeof QuxPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: providers.js
 ****************************************************************************************************/
import { Injectable, InjectionToken, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class Thing {
}
Thing.ɵfac = function Thing_Factory(t) { return new (t || Thing)(); };
Thing.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Thing, factory: Thing.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Thing, [{
        type: Injectable
    }], null, null); })();
export class BaseService {
    constructor(thing) {
        this.thing = thing;
    }
    ;
}
BaseService.ɵfac = function BaseService_Factory(t) { return new (t || BaseService)(i0.ɵɵinject(Thing)); };
BaseService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: BaseService, factory: BaseService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BaseService, [{
        type: Injectable
    }], function () { return [{ type: Thing }]; }, null); })();
export class ChildService extends BaseService {
}
ChildService.ɵfac = function ChildService_Factory(t) { return ɵChildService_BaseFactory(t || ChildService); };
ChildService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: ChildService, factory: ChildService.ɵfac });
const ɵChildService_BaseFactory = /*@__PURE__*/ i0.ɵɵgetInheritedFactory(ChildService);
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ChildService, [{
        type: Injectable
    }], null, null); })();
const MY_TOKEN = new InjectionToken('MY_TOKEN');
export class FooModule {
}
FooModule.ɵfac = function FooModule_Factory(t) { return new (t || FooModule)(); };
FooModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule });
FooModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooModule, providers: [
        Thing,
        BaseService,
        ChildService,
        { provide: MY_TOKEN, useFactory: (child) => ({ child }), deps: [ChildService] },
    ] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooModule, [{
        type: NgModule,
        args: [{
                providers: [
                    Thing,
                    BaseService,
                    ChildService,
                    { provide: MY_TOKEN, useFactory: (child) => ({ child }), deps: [ChildService] },
                ]
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: providers.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Thing {
    static ɵfac: i0.ɵɵFactoryDeclaration<Thing, never>;
    static ɵprov: i0.ɵɵInjectableDef<Thing>;
}
export declare class BaseService {
    protected thing: Thing;
    constructor(thing: Thing);
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseService, never>;
    static ɵprov: i0.ɵɵInjectableDef<BaseService>;
}
export declare class ChildService extends BaseService {
    static ɵfac: i0.ɵɵFactoryDeclaration<ChildService, never>;
    static ɵprov: i0.ɵɵInjectableDef<ChildService>;
}
export declare class FooModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<FooModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDef<FooModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: imports_exports.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class A1Component {
}
A1Component.ɵfac = function A1Component_Factory(t) { return new (t || A1Component)(); };
A1Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: A1Component, selector: "a1", ngImport: i0, template: 'A1', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(A1Component, [{
        type: Component,
        args: [{ selector: 'a1', template: 'A1' }]
    }], null, null); })();
export class A2Component {
}
A2Component.ɵfac = function A2Component_Factory(t) { return new (t || A2Component)(); };
A2Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: A2Component, selector: "a2", ngImport: i0, template: 'A2', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(A2Component, [{
        type: Component,
        args: [{ selector: 'a2', template: 'A2' }]
    }], null, null); })();
export class AModule {
}
AModule.ɵfac = function AModule_Factory(t) { return new (t || AModule)(); };
AModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, declarations: [A1Component, A2Component], exports: [A1Component, A2Component] });
AModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AModule, [{
        type: NgModule,
        args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
    }], null, null); })();
export class B1Component {
}
B1Component.ɵfac = function B1Component_Factory(t) { return new (t || B1Component)(); };
B1Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: B1Component, selector: "b1", ngImport: i0, template: 'B1', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(B1Component, [{
        type: Component,
        args: [{ selector: 'b1', template: 'B1' }]
    }], null, null); })();
export class B2Component {
}
B2Component.ɵfac = function B2Component_Factory(t) { return new (t || B2Component)(); };
B2Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: B2Component, selector: "b2", ngImport: i0, template: 'B2', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(B2Component, [{
        type: Component,
        args: [{ selector: 'b2', template: 'B2' }]
    }], null, null); })();
export class BModule {
}
BModule.ɵfac = function BModule_Factory(t) { return new (t || BModule)(); };
BModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, declarations: [B1Component, B2Component], exports: [AModule] });
BModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, imports: [AModule] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BModule, [{
        type: NgModule,
        args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
    }], null, null); })();
export class AppModule {
}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(); };
AppModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [BModule] });
AppModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [[BModule]] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppModule, [{
        type: NgModule,
        args: [{ imports: [BModule] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: imports_exports.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class A1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A1Component, "a1", never, {}, {}, never, never>;
}
export declare class A2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A2Component, "a2", never, {}, {}, never, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof A1Component, typeof A2Component], never, [typeof A1Component, typeof A2Component]>;
    static ɵinj: i0.ɵɵInjectorDef<AModule>;
}
export declare class B1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B1Component, "b1", never, {}, {}, never, never>;
}
export declare class B2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B2Component, "b2", never, {}, {}, never, never>;
}
export declare class BModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, [typeof B1Component, typeof B2Component], never, [typeof AModule]>;
    static ɵinj: i0.ɵɵInjectorDef<BModule>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof BModule], never>;
    static ɵinj: i0.ɵɵInjectorDef<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: imports_exports_jit_mode.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class A1Component {
}
A1Component.ɵfac = function A1Component_Factory(t) { return new (t || A1Component)(); };
A1Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: A1Component, selector: "a1", ngImport: i0, template: 'A1', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(A1Component, [{
        type: Component,
        args: [{ selector: 'a1', template: 'A1' }]
    }], null, null); })();
export class A2Component {
}
A2Component.ɵfac = function A2Component_Factory(t) { return new (t || A2Component)(); };
A2Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: A2Component, selector: "a2", ngImport: i0, template: 'A2', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(A2Component, [{
        type: Component,
        args: [{ selector: 'a2', template: 'A2' }]
    }], null, null); })();
export class AModule {
}
AModule.ɵfac = function AModule_Factory(t) { return new (t || AModule)(); };
AModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule, declarations: [A1Component, A2Component], exports: [A1Component, A2Component] });
AModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AModule, [{
        type: NgModule,
        args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
    }], null, null); })();
export class B1Component {
}
B1Component.ɵfac = function B1Component_Factory(t) { return new (t || B1Component)(); };
B1Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: B1Component, selector: "b1", ngImport: i0, template: 'B1', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(B1Component, [{
        type: Component,
        args: [{ selector: 'b1', template: 'B1' }]
    }], null, null); })();
export class B2Component {
}
B2Component.ɵfac = function B2Component_Factory(t) { return new (t || B2Component)(); };
B2Component.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: B2Component, selector: "b2", ngImport: i0, template: 'B2', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(B2Component, [{
        type: Component,
        args: [{ selector: 'b2', template: 'B2' }]
    }], null, null); })();
export class BModule {
}
BModule.ɵfac = function BModule_Factory(t) { return new (t || BModule)(); };
BModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, declarations: [B1Component, B2Component], exports: [AModule] });
BModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BModule, imports: [AModule] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BModule, [{
        type: NgModule,
        args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
    }], null, null); })();
export class AppModule {
}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(); };
AppModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [BModule] });
AppModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: AppModule, imports: [[BModule]] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppModule, [{
        type: NgModule,
        args: [{ imports: [BModule] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: imports_exports_jit_mode.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class A1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A1Component, "a1", never, {}, {}, never, never>;
}
export declare class A2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<A2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<A2Component, "a2", never, {}, {}, never, never>;
}
export declare class AModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AModule, [typeof A1Component, typeof A2Component], never, [typeof A1Component, typeof A2Component]>;
    static ɵinj: i0.ɵɵInjectorDef<AModule>;
}
export declare class B1Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B1Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B1Component, "b1", never, {}, {}, never, never>;
}
export declare class B2Component {
    static ɵfac: i0.ɵɵFactoryDeclaration<B2Component, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<B2Component, "b2", never, {}, {}, never, never>;
}
export declare class BModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BModule, [typeof B1Component, typeof B2Component], never, [typeof AModule]>;
    static ɵinj: i0.ɵɵInjectorDef<BModule>;
}
export declare class AppModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, [typeof BModule], never>;
    static ɵinj: i0.ɵɵInjectorDef<AppModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_aot.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
let NoAotModule = class NoAotModule {
};
NoAotModule = __decorate([
    NgModule({ jit: true })
], NoAotModule);
export { NoAotModule };

/****************************************************************************************************
 * PARTIAL FILE: no_aot.d.ts
 ****************************************************************************************************/
export declare class NoAotModule {
}

/****************************************************************************************************
 * PARTIAL FILE: inheritance.js
 ****************************************************************************************************/
import { Injectable, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class Service {
}
Service.ɵfac = function Service_Factory(t) { return new (t || Service)(); };
Service.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Service, factory: Service.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Service, [{
        type: Injectable
    }], null, null); })();
export class BaseModule {
    constructor(service) {
        this.service = service;
    }
}
BaseModule.ɵfac = function BaseModule_Factory(t) { return new (t || BaseModule)(i0.ɵɵinject(Service)); };
BaseModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseModule });
BaseModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BaseModule, providers: [Service] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BaseModule, [{
        type: NgModule,
        args: [{ providers: [Service] }]
    }], function () { return [{ type: Service }]; }, null); })();
export class BasicModule extends BaseModule {
}
BasicModule.ɵfac = function BasicModule_Factory(t) { return ɵBasicModule_BaseFactory(t || BasicModule); };
BasicModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
BasicModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: BasicModule });
const ɵBasicModule_BaseFactory = /*@__PURE__*/ i0.ɵɵgetInheritedFactory(BasicModule);
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BasicModule, [{
        type: NgModule,
        args: [{}]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: inheritance.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Service {
    static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;
    static ɵprov: i0.ɵɵInjectableDef<Service>;
}
export declare class BaseModule {
    private service;
    constructor(service: Service);
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BaseModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDef<BaseModule>;
}
export declare class BasicModule extends BaseModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<BasicModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDef<BasicModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: forward_refs.js
 ****************************************************************************************************/
import { NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export function provideModule() {
    return { ngModule: ForwardModule };
}
export class TestModule {
}
TestModule.ɵfac = function TestModule_Factory(t) { return new (t || TestModule)(); };
TestModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, imports: function () { return [ForwardModule]; } });
TestModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestModule, imports: [[provideModule()]] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TestModule, [{
        type: NgModule,
        args: [{ imports: [provideModule()] }]
    }], null, null); })();
export class ForwardModule {
}
ForwardModule.ɵfac = function ForwardModule_Factory(t) { return new (t || ForwardModule)(); };
ForwardModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForwardModule });
ForwardModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: ForwardModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ForwardModule, [{
        type: NgModule
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: forward_refs.d.ts
 ****************************************************************************************************/
import { ModuleWithProviders } from '@angular/core';
import * as i0 from "@angular/core";
export declare function provideModule(): ModuleWithProviders<ForwardModule>;
export declare class TestModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<TestModule, never, [typeof ForwardModule], never>;
    static ɵinj: i0.ɵɵInjectorDef<TestModule>;
}
export declare class ForwardModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<ForwardModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<ForwardModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDef<ForwardModule>;
}

