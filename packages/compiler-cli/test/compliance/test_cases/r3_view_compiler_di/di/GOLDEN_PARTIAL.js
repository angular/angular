/****************************************************************************************************
 * PARTIAL FILE: component_factory.js
 ****************************************************************************************************/
import { Attribute, Component, Host, Injectable, NgModule, Optional, Self, SkipSelf } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
}
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable
    }], null, null); })();
export class MyComponent {
    constructor(name, s1, s2, s4, s3, s5, s6) { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(i0.ɵɵinjectAttribute('name'), i0.ɵɵdirectiveInject(MyService), i0.ɵɵdirectiveInject(MyService, 1), i0.ɵɵdirectiveInject(MyService, 2), i0.ɵɵdirectiveInject(MyService, 4), i0.ɵɵdirectiveInject(MyService, 8), i0.ɵɵdirectiveInject(MyService, 10)); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: ``, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: `` }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Attribute,
                args: ['name']
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
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); }, providers: [MyService] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent], providers: [MyService] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: component_factory.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDef<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}
export declare class MyComponent {
    constructor(name: string, s1: MyService, s2: MyService, s4: MyService, s3: MyService, s5: MyService, s6: MyService);
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, [{ attribute: "name"; }, null, { host: true; }, { self: true; }, { skipSelf: true; }, { optional: true; }, { optional: true; self: true; }]>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
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
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(i0.ɵɵinject(MyDependency)); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
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
    static ɵfac: i0.ɵɵFactoryDef<MyService, never>;
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
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(i0.ɵɵinject(MyDependency), i0.ɵɵinject(MyOptionalDependency, 8)); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: MyService.ɵfac });
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
    static ɵfac: i0.ɵɵFactoryDef<MyService, [null, { optional: true; }]>;
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
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: function () { return alternateFactory(); }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable,
        args: [{ providedIn: 'root', useFactory: alternateFactory }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: usefactory_without_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDef<MyService, never>;
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
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: function MyService_Factory(t) { let r = null; if (t) {
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
    static ɵfac: i0.ɵɵFactoryDef<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_without_deps.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class MyAlternateService {
}
MyAlternateService.ɵfac = function MyAlternateService_Factory(t) { return new (t || MyAlternateService)(); };
MyAlternateService.ɵprov = i0.ɵɵdefineInjectable({ token: MyAlternateService, factory: MyAlternateService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyAlternateService, [{
        type: Injectable
    }], null, null); })();
export class MyService {
}
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: function (t) { return MyAlternateService.ɵfac(t); }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyService, [{
        type: Injectable,
        args: [{ providedIn: 'root', useClass: MyAlternateService }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: useclass_without_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDef<MyService, never>;
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
MyAlternateService.ɵfac = function MyAlternateService_Factory(t) { return new (t || MyAlternateService)(); };
MyAlternateService.ɵprov = i0.ɵɵdefineInjectable({ token: MyAlternateService, factory: MyAlternateService.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyAlternateService, [{
        type: Injectable
    }], null, null); })();
export class MyService {
}
MyService.ɵfac = function MyService_Factory(t) { return new (t || MyService)(); };
MyService.ɵprov = i0.ɵɵdefineInjectable({ token: MyService, factory: function MyService_Factory(t) { let r = null; if (t) {
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
    static ɵfac: i0.ɵɵFactoryDef<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDef<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_forwardref.js
 ****************************************************************************************************/
import { forwardRef, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class SomeProvider {
}
SomeProvider.ɵfac = function SomeProvider_Factory(t) { return new (t || SomeProvider)(); };
SomeProvider.ɵprov = i0.ɵɵdefineInjectable({ token: SomeProvider, factory: function (t) { return SomeProviderImpl.ɵfac(t); }, providedIn: 'root' });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeProvider, [{
        type: Injectable,
        args: [{ providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl) }]
    }], null, null); })();
class SomeProviderImpl extends SomeProvider {
}
SomeProviderImpl.ɵfac = function SomeProviderImpl_Factory(t) { return ɵSomeProviderImpl_BaseFactory(t || SomeProviderImpl); };
SomeProviderImpl.ɵprov = i0.ɵɵdefineInjectable({ token: SomeProviderImpl, factory: SomeProviderImpl.ɵfac });
const ɵSomeProviderImpl_BaseFactory = /*@__PURE__*/ i0.ɵɵgetInheritedFactory(SomeProviderImpl);
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
Service.ɵfac = function Service_Factory(t) { return new (t || Service)(); };
Service.ɵprov = i0.ɵɵdefineInjectable({ token: Service, factory: Service.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Service, [{
        type: Injectable
    }], null, null); })();
export class MyPipe {
    constructor(service) { }
    transform(value, ...args) {
        return value;
    }
}
MyPipe.ɵfac = function MyPipe_Factory(t) { return new (t || MyPipe)(i0.ɵɵdirectiveInject(Service)); };
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, name: "myPipe" });
MyPipe.ɵprov = i0.ɵɵdefineInjectable({ token: MyPipe, factory: MyPipe.ɵfac });
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
MyOtherPipe.ɵfac = function MyOtherPipe_Factory(t) { return new (t || MyOtherPipe)(i0.ɵɵdirectiveInject(Service)); };
MyOtherPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, name: "myOtherPipe" });
MyOtherPipe.ɵprov = i0.ɵɵdefineInjectable({ token: MyOtherPipe, factory: MyOtherPipe.ɵfac });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyOtherPipe, [{
        type: Pipe,
        args: [{ name: 'myOtherPipe' }]
    }, {
        type: Injectable
    }], function () { return [{ type: Service }]; }, null); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '{{0 | myPipe | myOtherPipe}}', isInline: true, pipes: { "myOtherPipe": MyOtherPipe, "myPipe": MyPipe } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '{{0 | myPipe | myOtherPipe}}' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); }, providers: [Service] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyPipe, MyOtherPipe, MyApp] }); })();
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
    static ɵfac: i0.ɵɵFactoryDef<Service, never>;
    static ɵprov: i0.ɵɵInjectableDef<Service>;
}
export declare class MyPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDef<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyPipe, "myPipe">;
    static ɵprov: i0.ɵɵInjectableDef<MyPipe>;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDef<MyOtherPipe, never>;
    static ɵpipe: i0.ɵɵPipeDefWithMeta<MyOtherPipe, "myOtherPipe">;
    static ɵprov: i0.ɵɵInjectableDef<MyOtherPipe>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyPipe, typeof MyOtherPipe, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}
export {};

