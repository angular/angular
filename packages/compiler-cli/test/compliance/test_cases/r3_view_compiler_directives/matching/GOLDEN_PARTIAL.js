/****************************************************************************************************
 * PARTIAL FILE: i18n_attribute_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class I18nDirective {
}
I18nDirective.ɵfac = function I18nDirective_Factory(t) { return new (t || I18nDirective)(); };
I18nDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: I18nDirective, selector: "[i18n]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18nDirective, [{
        type: Directive,
        args: [{ selector: '[i18n]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div i18n></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div i18n></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [I18nDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [I18nDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: i18n_attribute_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class I18nDirective {
    static ɵfac: i0.ɵɵFactoryDef<I18nDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<I18nDirective, "[i18n]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof I18nDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: i18n_prefix_attribute_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class I18nDirective {
}
I18nDirective.ɵfac = function I18nDirective_Factory(t) { return new (t || I18nDirective)(); };
I18nDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: I18nDirective, selector: "[i18n]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18nDirective, [{
        type: Directive,
        args: [{ selector: '[i18n]' }]
    }], null, null); })();
export class I18nFooDirective {
}
I18nFooDirective.ɵfac = function I18nFooDirective_Factory(t) { return new (t || I18nFooDirective)(); };
I18nFooDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: I18nFooDirective, selector: "[i18n-foo]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18nFooDirective, [{
        type: Directive,
        args: [{ selector: '[i18n-foo]' }]
    }], null, null); })();
export class FooDirective {
}
FooDirective.ɵfac = function FooDirective_Factory(t) { return new (t || FooDirective)(); };
FooDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: FooDirective, selector: "[foo]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooDirective, [{
        type: Directive,
        args: [{ selector: '[foo]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div i18n-foo></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div i18n-foo></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: i18n_prefix_attribute_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class I18nDirective {
    static ɵfac: i0.ɵɵFactoryDef<I18nDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<I18nDirective, "[i18n]", never, {}, {}, never>;
}
export declare class I18nFooDirective {
    static ɵfac: i0.ɵɵFactoryDef<I18nFooDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<I18nFooDirective, "[i18n-foo]", never, {}, {}, never>;
}
export declare class FooDirective {
    static ɵfac: i0.ɵɵFactoryDef<FooDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<FooDirective, "[foo]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof I18nDirective, typeof I18nFooDirective, typeof FooDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: property_binding_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", inputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Input
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div [someDirective]="true"></div>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", inputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div [someDirective]="true"></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: property_binding_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    someDirective: any;
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDirective]", never, { "someDirective": "someDirective"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class DirectiveA {
}
DirectiveA.ɵfac = function DirectiveA_Factory(t) { return new (t || DirectiveA)(); };
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: DirectiveA, selector: "ng-template[directiveA]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DirectiveA, [{
        type: Directive,
        args: [{ selector: 'ng-template[directiveA]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <ng-template directiveA>Some content</ng-template>
  `, isInline: true, directives: [{ type: DirectiveA, selector: "ng-template[directiveA]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <ng-template directiveA>Some content</ng-template>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [DirectiveA, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [DirectiveA, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_template_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDef<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<DirectiveA, "ng-template[directiveA]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof DirectiveA, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_container_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class DirectiveA {
}
DirectiveA.ɵfac = function DirectiveA_Factory(t) { return new (t || DirectiveA)(); };
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: DirectiveA, selector: "ng-container[directiveA]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DirectiveA, [{
        type: Directive,
        args: [{ selector: 'ng-container[directiveA]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: `
    <ng-container *ngIf="showing" directiveA>Some content</ng-container>
  `, isInline: true, directives: [{ type: DirectiveA, selector: "ng-container[directiveA]" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
    <ng-container *ngIf="showing" directiveA>Some content</ng-container>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [DirectiveA, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [DirectiveA, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_container_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDef<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<DirectiveA, "ng-container[directiveA]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof DirectiveA, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_binding_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", inputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Input
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<ng-template [someDirective]="true"></ng-template>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", inputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '<ng-template [someDirective]="true"></ng-template>',
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_template_binding_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    someDirective: any;
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDirective]", never, { "someDirective": "someDirective"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: structural_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", inputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Input
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div *someDirective></div>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", inputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div *someDirective></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: structural_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SomeDirective {
    someDirective: any;
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDirective]", never, { "someDirective": "someDirective"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: output_directive.js
 ****************************************************************************************************/
import { Component, Directive, EventEmitter, NgModule, Output } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
    constructor() {
        this.someDirective = new EventEmitter();
    }
}
SomeDirective.ɵfac = function SomeDirective_Factory(t) { return new (t || SomeDirective)(); };
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", outputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Output
        }] }); })();
export class MyComponent {
    noop() { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div (someDirective)="noop()"></div>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", outputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div (someDirective)="noop()"></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective, MyComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SomeDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: output_directive.d.ts
 ****************************************************************************************************/
import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class SomeDirective {
    someDirective: EventEmitter<unknown>;
    static ɵfac: i0.ɵɵFactoryDef<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<SomeDirective, "[someDirective]", never, {}, { "someDirective": "someDirective"; }, never>;
}
export declare class MyComponent {
    noop(): void;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

