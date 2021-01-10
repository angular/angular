/****************************************************************************************************
 * PARTIAL FILE: root_template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = function SimpleComponent_Factory(t) { return new (t || SimpleComponent)(); };
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SimpleComponent, selector: "simple", ngImport: i0, template: '<div><ng-content></ng-content></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SimpleComponent, [{
        type: Component,
        args: [{ selector: 'simple', template: '<div><ng-content></ng-content></div>' }]
    }], null, null); })();
export class ComplexComponent {
}
ComplexComponent.ɵfac = function ComplexComponent_Factory(t) { return new (t || ComplexComponent)(); };
ComplexComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: ComplexComponent, selector: "complex", ngImport: i0, template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ComplexComponent, [{
        type: Component,
        args: [{
                selector: 'complex',
                template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`
            }]
    }], null, null); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<simple>content</simple> <complex></complex>', isInline: true, directives: [{ type: SimpleComponent, selector: "simple" }, { type: ComplexComponent, selector: "complex" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<simple>content</simple> <complex></complex>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SimpleComponent, ComplexComponent, MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SimpleComponent, ComplexComponent, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: root_template.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDef<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SimpleComponent, "simple", never, {}, {}, never, ["*"]>;
}
export declare class ComplexComponent {
    static ɵfac: i0.ɵɵFactoryDef<ComplexComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<ComplexComponent, "complex", never, {}, {}, never, ["span[title=toFirst]", "span[title=toSecond]"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SimpleComponent, typeof ComplexComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: multiple_wildcards.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Cmp {
}
Cmp.ɵfac = function Cmp_Factory(t) { return new (t || Cmp)(); };
Cmp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Cmp, selector: "ng-component", ngImport: i0, template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Cmp, [{
        type: Component,
        args: [{
                template: `
    <ng-content></ng-content>
    <ng-content select="[spacer]"></ng-content>
    <ng-content></ng-content>
  `,
            }]
    }], null, null); })();
class Module {
}
Module.ɵmod = i0.ɵɵdefineNgModule({ type: Module });
Module.ɵinj = i0.ɵɵdefineInjector({ factory: function Module_Factory(t) { return new (t || Module)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Module, [{
        type: NgModule,
        args: [{ declarations: [Cmp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: multiple_wildcards.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: nested_template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Cmp {
}
Cmp.ɵfac = function Cmp_Factory(t) { return new (t || Cmp)(); };
Cmp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Cmp, selector: "ng-component", ngImport: i0, template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">
      No ng-content, no instructions generated.
    </div>
    <ng-template>
      '*' selector: <ng-content></ng-content>
    </ng-template>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Cmp, [{
        type: Component,
        args: [{
                template: `
    <div id="second" *ngIf="visible">
      <ng-content SELECT="span[title=toFirst]"></ng-content>
    </div>
    <div id="third" *ngIf="visible">
      No ng-content, no instructions generated.
    </div>
    <ng-template>
      '*' selector: <ng-content></ng-content>
    </ng-template>
  `,
            }]
    }], null, null); })();
class Module {
}
Module.ɵmod = i0.ɵɵdefineNgModule({ type: Module });
Module.ɵinj = i0.ɵɵdefineInjector({ factory: function Module_Factory(t) { return new (t || Module)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Module, [{
        type: NgModule,
        args: [{ declarations: [Cmp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: nested_template.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: root_and_nested.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
class Cmp {
}
Cmp.ɵfac = function Cmp_Factory(t) { return new (t || Cmp)(); };
Cmp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Cmp, selector: "ng-component", ngImport: i0, template: `
    <ng-content select="[id=toMainBefore]"></ng-content>
    <ng-template>
      <ng-content select="[id=toTemplate]"></ng-content>
      <ng-template>
        <ng-content select="[id=toNestedTemplate]"></ng-content>
      </ng-template>
    </ng-template>
    <ng-template>
      '*' selector in a template: <ng-content></ng-content>
    </ng-template>
    <ng-content select="[id=toMainAfter]"></ng-content>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Cmp, [{
        type: Component,
        args: [{
                template: `
    <ng-content select="[id=toMainBefore]"></ng-content>
    <ng-template>
      <ng-content select="[id=toTemplate]"></ng-content>
      <ng-template>
        <ng-content select="[id=toNestedTemplate]"></ng-content>
      </ng-template>
    </ng-template>
    <ng-template>
      '*' selector in a template: <ng-content></ng-content>
    </ng-template>
    <ng-content select="[id=toMainAfter]"></ng-content>
  `,
            }]
    }], null, null); })();
class Module {
}
Module.ɵmod = i0.ɵɵdefineNgModule({ type: Module });
Module.ɵinj = i0.ɵɵdefineInjector({ factory: function Module_Factory(t) { return new (t || Module)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(Module, { declarations: [Cmp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Module, [{
        type: NgModule,
        args: [{ declarations: [Cmp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: root_and_nested.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_selector.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = function SimpleComponent_Factory(t) { return new (t || SimpleComponent)(); };
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SimpleComponent, selector: "simple", ngImport: i0, template: '<div><ng-content select="[title]"></ng-content></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SimpleComponent, [{
        type: Component,
        args: [{ selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>' }]
    }], null, null); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<simple><h1 ngProjectAs="[title]"></h1></simple>', isInline: true, directives: [{ type: SimpleComponent, selector: "simple" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<simple><h1 ngProjectAs="[title]"></h1></simple>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp, SimpleComponent] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyApp, SimpleComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDef<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SimpleComponent, "simple", never, {}, {}, never, ["[title]"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyApp, typeof SimpleComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_compound_selector.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = function SimpleComponent_Factory(t) { return new (t || SimpleComponent)(); };
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SimpleComponent, selector: "simple", ngImport: i0, template: '<div><ng-content select="[title]"></ng-content></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SimpleComponent, [{
        type: Component,
        args: [{ selector: 'simple', template: '<div><ng-content select="[title]"></ng-content></div>' }]
    }], null, null); })();
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>', isInline: true, directives: [{ type: SimpleComponent, selector: "simple" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<simple><h1 ngProjectAs="[title],[header]"></h1></simple>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SimpleComponent, MyApp] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [SimpleComponent, MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_compound_selector.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDef<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SimpleComponent, "simple", never, {}, {}, never, ["[title]"]>;
}
export declare class MyApp {
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof SimpleComponent, typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_attribute.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.show = true;
    }
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyApp, selector: "my-app", ngImport: i0, template: '<div *ngIf="show" ngProjectAs=".someclass"></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{ selector: 'my-app', template: '<div *ngIf="show" ngProjectAs=".someclass"></div>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_project_as_attribute.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    show: boolean;
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng_content_with_structural_dir.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class SimpleComponent {
}
SimpleComponent.ɵfac = function SimpleComponent_Factory(t) { return new (t || SimpleComponent)(); };
SimpleComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: SimpleComponent, selector: "simple", ngImport: i0, template: '<ng-content *ngIf="showContent"></ng-content>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SimpleComponent, [{
        type: Component,
        args: [{ selector: 'simple', template: '<ng-content *ngIf="showContent"></ng-content>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng_content_with_structural_dir.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SimpleComponent {
    static ɵfac: i0.ɵɵFactoryDef<SimpleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<SimpleComponent, "simple", never, {}, {}, never, ["*"]>;
}

