/****************************************************************************************************
 * PARTIAL FILE: component_factory.js
 ****************************************************************************************************/
import { Attribute, Component, Host, Injectable, NgModule, Optional, Self, SkipSelf } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable
    }], null, null); })();
function dynamicAttrName() {
    return 'the-attr';
}
export class MyComponent {
    constructor(name, other, s1, s2, s4, s3, s5, s6) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [{ token: 'name', attribute: true }, { token: dynamicAttrName(), attribute: true }, { token: MyService }, { token: MyService, host: true }, { token: MyService, self: true }, { token: MyService, skipSelf: true }, { token: MyService, optional: true }, { token: MyService, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: ``, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: `` }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Attribute,
                args: ['name']
            }] }, { type: undefined, decorators: [{
                type: Attribute,
                args: [dynamicAttrName()]
            }] }, { type: MyService }, { type: MyService, decorators: [{
                type: Host
            }] }, { type: MyService, decorators: [{
                type: Self
            }] }, { type: MyService, decorators: [{
                type: SkipSelf
            }] }, { type: MyService, decorators: [{
                type: Optional
            }] }, { type: MyService, decorators: [{
                type: Self
            }, {
                type: Optional
            }] }]; }, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, providers: [MyService] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent], providers: [MyService] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: component_factory.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}
export declare class MyComponent {
    constructor(name: string, other: string, s1: MyService, s2: MyService, s4: MyService, s3: MyService, s5: MyService, s6: MyService);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, [{ attribute: "name"; }, { attribute: unknown; }, null, { host: true; }, { self: true; }, { skipSelf: true; }, { optional: true; }, { optional: true; self: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: injectable_factory.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class MyDependency {
}
export class MyService {
    constructor(dep) { }
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [{ token: MyDependency }], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable
    }], function () { return [{ type: MyDependency }]; }, null); })();

/****************************************************************************************************
 * PARTIAL FILE: injectable_factory.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
declare class MyDependency {
}
export declare class MyService {
    constructor(dep: MyDependency);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}
export {};

/****************************************************************************************************
 * PARTIAL FILE: ctor_overload.js
 ****************************************************************************************************/
import { Injectable, Optional } from '@angular/core';
import * as i0 from "@angular/core";
class MyDependency {
}
class MyOptionalDependency {
}
export class MyService {
    constructor(dep, optionalDep) { }
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [{ token: MyDependency }, { token: MyOptionalDependency, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable
    }], function () { return [{ type: MyDependency }, { type: MyOptionalDependency, decorators: [{
                type: Optional
            }] }]; }, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ctor_overload.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
declare class MyDependency {
}
export declare class MyService {
    constructor(dep: MyDependency);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, [null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}
export {};

/****************************************************************************************************
 * PARTIAL FILE: usefactory_without_deps.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class MyAlternateService {
}
function alternateFactory() {
    return new MyAlternateService();
}
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: function () { return alternateFactory(); }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable,
        args: [{ providedIn: 'root', useFactory: alternateFactory }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: usefactory_without_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: usefactory_with_deps.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class SomeDep {
}
class MyAlternateService {
}
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: function MyService_Factory(t) { let r = null; if (t) {
        r = new t();
    }
    else {
        r = (() => new MyAlternateService())(i0.ɵɵinject(SomeDep));
    } return r; }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable,
        args: [{ providedIn: 'root', useFactory: () => new MyAlternateService(), deps: [SomeDep] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: usefactory_with_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_without_deps.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class MyAlternateService {
}
MyAlternateService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyAlternateService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyAlternateService, factory: MyAlternateService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyAlternateService, [{
        type: Injectable
    }], null, null); })();
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: function (t) { return MyAlternateService.ɵfac(t); }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable,
        args: [{ providedIn: 'root', useClass: MyAlternateService }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: useclass_without_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_with_deps.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class SomeDep {
}
class MyAlternateService {
}
MyAlternateService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyAlternateService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyAlternateService, factory: MyAlternateService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyAlternateService, [{
        type: Injectable
    }], null, null); })();
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyService, factory: function MyService_Factory(t) { let r = null; if (t) {
        r = new t();
    }
    else {
        r = new MyAlternateService(i0.ɵɵinject(SomeDep));
    } return r; }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable,
        args: [{ providedIn: 'root', useClass: MyAlternateService, deps: [SomeDep] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: useclass_with_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_forwardref.js
 ****************************************************************************************************/
import { forwardRef, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class SomeProvider {
}
SomeProvider.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProvider, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
SomeProvider.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SomeProvider, factory: function (t) { return SomeProviderImpl.ɵfac(t); }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeProvider, [{
        type: Injectable,
        args: [{ providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl) }]
    }], null, null); })();
class SomeProviderImpl extends SomeProvider {
}
SomeProviderImpl.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProviderImpl, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
SomeProviderImpl.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SomeProviderImpl, factory: SomeProviderImpl.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeProviderImpl, [{
        type: Injectable
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: useclass_forwardref.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: pipe_and_injectable.js
 ****************************************************************************************************/
import { Component, Injectable, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
class Service {
}
Service.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
Service.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Service, factory: Service.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Service, [{
        type: Injectable
    }], null, null); })();
export class MyPipe {
    constructor(service) { }
    transform(value, ...args) {
        return value;
    }
}
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [{ token: Service }], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, name: "myPipe" });
MyPipe.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyPipe, factory: MyPipe.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyPipe, [{
        type: Injectable
    }, {
        type: Pipe,
        args: [{ name: 'myPipe' }]
    }], function () { return [{ type: Service }]; }, null); })();
export class MyOtherPipe {
    constructor(service) { }
    transform(value, ...args) {
        return value;
    }
}
MyOtherPipe.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, deps: [{ token: Service }], target: i0.ɵɵFactoryTarget.Pipe });
MyOtherPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, name: "myOtherPipe" });
MyOtherPipe.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MyOtherPipe, factory: MyOtherPipe.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyOtherPipe, [{
        type: Pipe,
        args: [{ name: 'myOtherPipe' }]
    }, {
        type: Injectable
    }], function () { return [{ type: Service }]; }, null); })();
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '{{0 | myPipe | myOtherPipe}}', isInline: true, pipes: { "myOtherPipe": MyOtherPipe, "myPipe": MyPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '{{0 | myPipe | myOtherPipe}}' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyOtherPipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, providers: [Service] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyPipe, MyOtherPipe, MyApp], providers: [Service] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: pipe_and_injectable.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
declare class Service {
    static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;
    static ɵprov: i0.ɵɵInjectableDef<Service>;
}
export declare class MyPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe">;
    static ɵprov: i0.ɵɵInjectableDef<MyPipe>;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, "myOtherPipe">;
    static ɵprov: i0.ɵɵInjectableDef<MyOtherPipe>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyPipe, typeof MyOtherPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}
export {};

