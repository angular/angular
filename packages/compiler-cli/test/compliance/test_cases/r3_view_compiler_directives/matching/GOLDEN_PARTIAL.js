/****************************************************************************************************
 * PARTIAL FILE: i18n_attribute_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class I18nDirective {
}
I18nDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: I18nDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
I18nDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: I18nDirective, selector: "[i18n]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18nDirective, [{
        type: Directive,
        args: [{ selector: '[i18n]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div i18n></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div i18n></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [I18nDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [I18nDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: i18n_attribute_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class I18nDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<I18nDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<I18nDirective, "[i18n]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof I18nDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: i18n_prefix_attribute_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class I18nDirective {
}
I18nDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: I18nDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
I18nDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: I18nDirective, selector: "[i18n]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18nDirective, [{
        type: Directive,
        args: [{ selector: '[i18n]' }]
    }], null, null); })();
export class I18nFooDirective {
}
I18nFooDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: I18nFooDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
I18nFooDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: I18nFooDirective, selector: "[i18n-foo]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(I18nFooDirective, [{
        type: Directive,
        args: [{ selector: '[i18n-foo]' }]
    }], null, null); })();
export class FooDirective {
}
FooDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FooDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
FooDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: FooDirective, selector: "[foo]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooDirective, [{
        type: Directive,
        args: [{ selector: '[foo]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div i18n-foo></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div i18n-foo></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [I18nDirective, I18nFooDirective, FooDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: i18n_prefix_attribute_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class I18nDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<I18nDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<I18nDirective, "[i18n]", never, {}, {}, never>;
}
export declare class I18nFooDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<I18nFooDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<I18nFooDirective, "[i18n-foo]", never, {}, {}, never>;
}
export declare class FooDirective {
    static ɵfac: i0.ɵɵFactoryDeclaration<FooDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<FooDirective, "[foo]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof I18nDirective, typeof I18nFooDirective, typeof FooDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: property_binding_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", inputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Input
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div [someDirective]="true"></div>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", inputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div [someDirective]="true"></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDirective]", never, { "someDirective": "someDirective"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class DirectiveA {
}
DirectiveA.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: DirectiveA, selector: "ng-template[directiveA]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DirectiveA, [{
        type: Directive,
        args: [{ selector: 'ng-template[directiveA]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
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
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [DirectiveA, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [DirectiveA, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_template_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, "ng-template[directiveA]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof DirectiveA, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_container_directive.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class DirectiveA {
}
DirectiveA.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DirectiveA, deps: [], target: i0.ɵɵFactoryTarget.Directive });
DirectiveA.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: DirectiveA, selector: "ng-container[directiveA]", ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DirectiveA, [{
        type: Directive,
        args: [{ selector: 'ng-container[directiveA]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
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
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [DirectiveA, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [DirectiveA, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_container_directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DirectiveA {
    static ɵfac: i0.ɵɵFactoryDeclaration<DirectiveA, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<DirectiveA, "ng-container[directiveA]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof DirectiveA, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_template_binding_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", inputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Input
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
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
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDirective]", never, { "someDirective": "someDirective"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: structural_directive.js
 ****************************************************************************************************/
import { Component, Directive, Input, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SomeDirective {
}
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
SomeDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: "0.0.0-PLACEHOLDER", type: SomeDirective, selector: "[someDirective]", inputs: { someDirective: "someDirective" }, ngImport: i0 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SomeDirective, [{
        type: Directive,
        args: [{ selector: '[someDirective]' }]
    }], null, { someDirective: [{
            type: Input
        }] }); })();
export class MyComponent {
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div *someDirective></div>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", inputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div *someDirective></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDirective]", never, { "someDirective": "someDirective"; }, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
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
SomeDirective.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SomeDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
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
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div (someDirective)="noop()"></div>', isInline: true, directives: [{ type: SomeDirective, selector: "[someDirective]", outputs: ["someDirective"] }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div (someDirective)="noop()"></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [SomeDirective, MyComponent] });
MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
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
    static ɵfac: i0.ɵɵFactoryDeclaration<SomeDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<SomeDirective, "[someDirective]", never, {}, { "someDirective": "someDirective"; }, never>;
}
export declare class MyComponent {
    noop(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof SomeDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MyModule>;
}

