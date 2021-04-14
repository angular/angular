/****************************************************************************************************
 * PARTIAL FILE: component_factory.js
 ****************************************************************************************************/
import { Attribute, Component, Host, Injectable, NgModule, Optional, Self, SkipSelf } from '@angular/core';
import * as i0 from "@angular/core";
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable
        }] });
function dynamicAttrName() {
    return 'the-attr';
}
export class MyComponent {
    constructor(name, other, s1, s2, s4, s3, s5, s6) { }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [{ token: 'name', attribute: true }, { token: dynamicAttrName(), attribute: true }, { token: MyService }, { token: MyService, host: true }, { token: MyService, self: true }, { token: MyService, skipSelf: true }, { token: MyService, optional: true }, { token: MyService, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: ``, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, decorators: [{
            type: Component,
            args: [{ selector: 'my-component', template: `` }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
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
                }] }]; } });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, providers: [MyService] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyComponent], providers: [MyService] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: component_factory.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
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
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [{ token: MyDependency }], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: MyDependency }]; } });

/****************************************************************************************************
 * PARTIAL FILE: injectable_factory.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
declare class MyDependency {
}
export declare class MyService {
    constructor(dep: MyDependency);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
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
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [{ token: MyDependency }, { token: MyOptionalDependency, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: MyDependency }, { type: MyOptionalDependency, decorators: [{
                    type: Optional
                }] }]; } });

/****************************************************************************************************
 * PARTIAL FILE: ctor_overload.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
declare class MyDependency {
}
export declare class MyService {
    constructor(dep: MyDependency);
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, [null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
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
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, providedIn: 'root', useFactory: alternateFactory });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: alternateFactory }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: usefactory_without_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
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
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, providedIn: 'root', useFactory: () => new MyAlternateService(), deps: [{ token: SomeDep }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useFactory: () => new MyAlternateService(), deps: [SomeDep] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: usefactory_with_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_without_deps.js
 ****************************************************************************************************/
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class MyAlternateService {
}
MyAlternateService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyAlternateService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService, decorators: [{
            type: Injectable
        }] });
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, providedIn: 'root', useClass: MyAlternateService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useClass: MyAlternateService }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: useclass_without_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
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
MyAlternateService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyAlternateService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyAlternateService, decorators: [{
            type: Injectable
        }] });
export class MyService {
}
MyService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
MyService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, providedIn: 'root', useClass: MyAlternateService, deps: [{ token: SomeDep }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useClass: MyAlternateService, deps: [SomeDep] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: useclass_with_deps.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyService {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyService>;
}

/****************************************************************************************************
 * PARTIAL FILE: useclass_forwardref.js
 ****************************************************************************************************/
import { forwardRef, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
class SomeProvider {
}
SomeProvider.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProvider, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
SomeProvider.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProvider, providedIn: 'root', useClass: i0.forwardRef(function () { return SomeProviderImpl; }) });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProvider, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl) }]
        }] });
class SomeProviderImpl extends SomeProvider {
}
SomeProviderImpl.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProviderImpl, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
SomeProviderImpl.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProviderImpl });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeProviderImpl, decorators: [{
            type: Injectable
        }] });

/****************************************************************************************************
 * PARTIAL FILE: useclass_forwardref.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: providedin_forwardref.js
 ****************************************************************************************************/
import { forwardRef, Injectable, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class Dep {
}
Dep.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dep, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
Dep.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dep });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Dep, decorators: [{
            type: Injectable
        }] });
export class Service {
    constructor(dep) { }
}
Service.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, deps: [{ token: Dep }], target: i0.ɵɵFactoryTarget.Injectable });
Service.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, providedIn: i0.forwardRef(function () { return Mod; }) });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, decorators: [{
            type: Injectable,
            args: [{ providedIn: forwardRef(() => Mod) }]
        }], ctorParameters: function () { return [{ type: Dep }]; } });
export class Mod {
}
Mod.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Mod, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Mod.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Mod });
Mod.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Mod });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Mod, decorators: [{
            type: NgModule
        }] });

/****************************************************************************************************
 * PARTIAL FILE: providedin_forwardref.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class Dep {
    static ɵfac: i0.ɵɵFactoryDeclaration<Dep, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Dep>;
}
export declare class Service {
    constructor(dep: Dep);
    static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Service>;
}
export declare class Mod {
    static ɵfac: i0.ɵɵFactoryDeclaration<Mod, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<Mod, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<Mod>;
}

/****************************************************************************************************
 * PARTIAL FILE: pipe_and_injectable.js
 ****************************************************************************************************/
import { Component, Injectable, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
class Service {
}
Service.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
Service.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Service, decorators: [{
            type: Injectable
        }] });
export class MyPipe {
    constructor(service) { }
    transform(value, ...args) {
        return value;
    }
}
MyPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, deps: [{ token: Service }], target: i0.ɵɵFactoryTarget.Pipe });
MyPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, name: "myPipe" });
MyPipe.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyPipe, decorators: [{
            type: Injectable
        }, {
            type: Pipe,
            args: [{ name: 'myPipe' }]
        }], ctorParameters: function () { return [{ type: Service }]; } });
export class MyOtherPipe {
    constructor(service) { }
    transform(value, ...args) {
        return value;
    }
}
MyOtherPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, deps: [{ token: Service }], target: i0.ɵɵFactoryTarget.Pipe });
MyOtherPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, name: "myOtherPipe" });
MyOtherPipe.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyOtherPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'myOtherPipe' }]
        }, {
            type: Injectable
        }], ctorParameters: function () { return [{ type: Service }]; } });
export class MyApp {
}
MyApp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '{{0 | myPipe | myOtherPipe}}', isInline: true, pipes: { "myOtherPipe": MyOtherPipe, "myPipe": MyPipe } });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyApp, decorators: [{
            type: Component,
            args: [{ selector: 'my-app', template: '{{0 | myPipe | myOtherPipe}}' }]
        }] });
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyPipe, MyOtherPipe, MyApp] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, providers: [Service] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, decorators: [{
            type: NgModule,
            args: [{ declarations: [MyPipe, MyOtherPipe, MyApp], providers: [Service] }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: pipe_and_injectable.d.ts
 ****************************************************************************************************/
import { PipeTransform } from '@angular/core';
import * as i0 from "@angular/core";
declare class Service {
    static ɵfac: i0.ɵɵFactoryDeclaration<Service, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Service>;
}
export declare class MyPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyPipe, "myPipe">;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyPipe>;
}
export declare class MyOtherPipe implements PipeTransform {
    constructor(service: Service);
    transform(value: any, ...args: any[]): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<MyOtherPipe, "myOtherPipe">;
    static ɵprov: i0.ɵɵInjectableDeclaration<MyOtherPipe>;
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

