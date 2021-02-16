/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingComp {
}
HostBindingComp.ɵfac = function HostBindingComp_Factory(t) { return new (t || HostBindingComp)(); };
HostBindingComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: HostBindingComp, selector: "host-binding-comp", ngImport: i0, template: `
    <my-forward-directive></my-forward-directive>
  `, isInline: true, directives: [{ type: i0.forwardRef(function () { return MyForwardDirective; }), selector: "my-forward-directive" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HostBindingComp, [{
        type: Component,
        args: [{
                selector: 'host-binding-comp',
                template: `
    <my-forward-directive></my-forward-directive>
  `
            }]
    }], null, null); })();
class MyForwardDirective {
}
MyForwardDirective.ɵfac = function MyForwardDirective_Factory(t) { return new (t || MyForwardDirective)(); };
MyForwardDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: MyForwardDirective, selector: "my-forward-directive", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyForwardDirective, [{
        type: Directive,
        args: [{ selector: 'my-forward-directive' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp, MyForwardDirective] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostBindingComp, MyForwardDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingComp {
    static ɵfac: i0.ɵɵFactoryDef<HostBindingComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<HostBindingComp, "host-binding-comp", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostBindingComp, typeof MyForwardDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_pipe.js
 ****************************************************************************************************/
import { Component, NgModule, Pipe } from '@angular/core';
import * as i0 from "@angular/core";
export class HostBindingComp {
}
HostBindingComp.ɵfac = function HostBindingComp_Factory(t) { return new (t || HostBindingComp)(); };
HostBindingComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: HostBindingComp, selector: "host-binding-comp", ngImport: i0, template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
  `, isInline: true, pipes: { "my_forward_pipe": i0.forwardRef(function () { return MyForwardPipe; }) } });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(HostBindingComp, [{
        type: Component,
        args: [{
                selector: 'host-binding-comp',
                template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
  `
            }]
    }], null, null); })();
class MyForwardPipe {
}
MyForwardPipe.ɵfac = function MyForwardPipe_Factory(t) { return new (t || MyForwardPipe)(); };
MyForwardPipe.ɵpipe = i0.ɵɵngDeclarePipe({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyForwardPipe, name: "my_forward_pipe" });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyForwardPipe, [{
        type: Pipe,
        args: [{ name: 'my_forward_pipe' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp, MyForwardPipe] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [HostBindingComp, MyForwardPipe] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: forward_referenced_pipe.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class HostBindingComp {
    static ɵfac: i0.ɵɵFactoryDef<HostBindingComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<HostBindingComp, "host-binding-comp", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof HostBindingComp, typeof MyForwardPipe], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: export_as.js
 ****************************************************************************************************/
import { Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[some-directive]", exportAs: ["someDir", "otherDir"], ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[some-directive]', exportAs: 'someDir, otherDir' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: export_as.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[some-directive]", ["someDir", "otherDir"], {}, {}, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SomeDirective], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: no_selector.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
export class AbstractDirective {
}
AbstractDirective.ɵfac = function AbstractDirective_Factory(t) { return new (t || AbstractDirective)(); };
AbstractDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: AbstractDirective, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AbstractDirective, [{
        type: Directive
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: no_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class AbstractDirective {
    static ɵfac: i0.ɵɵFactoryDef<AbstractDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<AbstractDirective, never, never, {}, {}, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: constant_object_literals.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComp {
}
SomeComp.ɵfac = function SomeComp_Factory(t) { return new (t || SomeComp)(); };
SomeComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SomeComp, selector: "some-comp", inputs: { prop: "prop", otherProp: "otherProp" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeComp, [{
        type: Component,
        args: [{ selector: 'some-comp', template: '' }]
    }], null, { prop: [{
            type: Input
        }], otherProp: [{
            type: Input
        }] }); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "ng-component", ngImport: i0, template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>', isInline: true, directives: [{ type: SomeComp, selector: "some-comp", inputs: ["prop", "otherProp"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ template: '<some-comp [prop]="{}" [otherProp]="{a: 1, b: 2}"></some-comp>' }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵmod = i0.ɵɵdefineNgModule({ type: MyMod });
MyMod.ɵinj = i0.ɵɵdefineInjector({ factory: function MyMod_Factory(t) { return new (t || MyMod)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyMod, { declarations: [SomeComp, MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [SomeComp, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: constant_object_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeComp {
    prop: any;
    otherProp: any;
    static ɵfac: i0.ɵɵFactoryDef<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SomeComp, "some-comp", never, { "prop": "prop"; "otherProp": "otherProp"; }, {}, never, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyMod, [typeof SomeComp, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: constant_array_literals.js
 ****************************************************************************************************/
import { Component, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeComp {
}
SomeComp.ɵfac = function SomeComp_Factory(t) { return new (t || SomeComp)(); };
SomeComp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SomeComp, selector: "some-comp", inputs: { prop: "prop", otherProp: "otherProp" }, ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeComp, [{
        type: Component,
        args: [{ selector: 'some-comp', template: '' }]
    }], null, { prop: [{
            type: Input
        }], otherProp: [{
            type: Input
        }] }); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "ng-component", ngImport: i0, template: '<some-comp [prop]="[]" [otherProp]="[0, 1, 2]"></some-comp>', isInline: true, directives: [{ type: SomeComp, selector: "some-comp", inputs: ["prop", "otherProp"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ template: '<some-comp [prop]="[]" [otherProp]="[0, 1, 2]"></some-comp>' }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵmod = i0.ɵɵdefineNgModule({ type: MyMod });
MyMod.ɵinj = i0.ɵɵdefineInjector({ factory: function MyMod_Factory(t) { return new (t || MyMod)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyApp, SomeComp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [MyApp, SomeComp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: constant_array_literals.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeComp {
    prop: any;
    otherProp: any;
    static ɵfac: i0.ɵɵFactoryDef<SomeComp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SomeComp, "some-comp", never, { "prop": "prop"; "otherProp": "otherProp"; }, {}, never, never>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyMod, [typeof MyApp, typeof SomeComp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_empty.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "ng-component", ngImport: i0, template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: {}}"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: {}}"></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_empty.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "ng-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: array_literals_null_vs_empty.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "ng-component", ngImport: i0, template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: []}"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: []}"></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: array_literals_null_vs_empty.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "ng-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_function.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    getFoo() {
        return 'foo!';
    }
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "ng-component", ngImport: i0, template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: getFoo()}"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: getFoo()}"></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: object_literals_null_vs_function.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    getFoo(): string;
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "ng-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: custom_decorator_es5.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
var token = new InjectionToken('token');
export function Custom() {
    return function (target) { };
}
var Comp = /** @class */ (function () {
    function Comp() {
    }
    Comp_1 = Comp;
    var Comp_1;
    Comp.ɵfac = function Comp_Factory(t) { return new (t || Comp)(); };
    Comp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Comp, selector: "ng-component", providers: [{ provide: token, useExisting: Comp_1 }], ngImport: i0, template: '', isInline: true });
    Comp = Comp_1 = __decorate([
        Custom()
    ], Comp);
    return Comp;
}());
export { Comp };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
        type: Component,
        args: [{
                template: '',
                providers: [{ provide: token, useExisting: Comp }],
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: custom_decorator_es5.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare function Custom(): (target: any) => void;
export declare class Comp {
    static ɵfac: i0.ɵɵFactoryDef<Comp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<Comp, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_empty_binding.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-app", ngImport: i0, template: '<ng-template [id]=""></ng-template>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<ng-template [id]=""></ng-template>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_template_empty_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

