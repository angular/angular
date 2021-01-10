/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button [attr.title]="myTitle" attr.id="{{buttonId}}" [attr.tabindex]="1"></button>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button [attr.title]="myTitle" attr.id="{{buttonId}}" [attr.tabindex]="1"></button>
  `
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_single_interpolation.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button attr.title="{{myTitle}}" attr.id="{{buttonId}}" attr.tabindex="{{1}}"></button>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button attr.title="{{myTitle}}" attr.id="{{buttonId}}" attr.tabindex="{{1}}"></button>
  `
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_single_interpolation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_mixed.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
    </button>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
    </button>
  `
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_mixed.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_bindings_with_interpolations.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button
      [attr.title]="1"
      [attr.id]="2"
      attr.tabindex="prefix-{{0 + 3}}"
      attr.aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button
      [attr.title]="1"
      [attr.id]="2"
      attr.tabindex="prefix-{{0 + 3}}"
      attr.aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>`
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_bindings_with_interpolations.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_for_multiple_elements.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class CustomEl {
}
CustomEl.ɵfac = function CustomEl_Factory(t) { return new (t || CustomEl)(); };
CustomEl.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: CustomEl, selector: "custom-element", ngImport: i0, template: '', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CustomEl, [{
        type: Component,
        args: [{ selector: 'custom-element', template: '' }]
    }], null, null); })();
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1"></button>
    <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    <custom-element [attr.some-attr]="'one'" [attr.some-other-attr]="2"></custom-element>
  `, isInline: true, directives: [{ type: CustomEl, selector: "custom-element" }] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1"></button>
    <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    <custom-element [attr.some-attr]="'one'" [attr.some-other-attr]="2"></custom-element>
  `
            }]
    }], null, null); })();
export class MyMod {
}
MyMod.ɵmod = i0.ɵɵdefineNgModule({ type: MyMod });
MyMod.ɵinj = i0.ɵɵdefineInjector({ factory: function MyMod_Factory(t) { return new (t || MyMod)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyMod, { declarations: [MyComponent, CustomEl] }); })();
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyMod, [{
        type: NgModule,
        args: [{ declarations: [MyComponent, CustomEl] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_for_multiple_elements.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class CustomEl {
    static ɵfac: i0.ɵɵFactoryDef<CustomEl, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<CustomEl, "custom-element", never, {}, {}, never, never>;
}
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}
export declare class MyMod {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyMod, [typeof MyComponent, typeof CustomEl], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyMod>;
}

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_with_child_elements.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.myTitle = 'hello';
        this.buttonId = 'special-button';
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
      <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    </button>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                template: `
    <button [attr.title]="myTitle" [attr.id]="buttonId" [attr.tabindex]="1">
      <span [attr.id]="1" [attr.title]="'hello'" [attr.some-attr]="1 + 2"></span>
    </button>`
            }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: chain_multiple_bindings_with_child_elements.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    myTitle: string;
    buttonId: string;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "ng-component", never, {}, {}, never, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: exclude_bindings_from_consts.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    doThings() { }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-app", ngImport: i0, template: `<a
    target="_blank"
    [title]="1"
    [attr.foo]="'one'"
    (customEvent)="doThings()"
    [attr.bar]="'two'"
    [id]="2"
    aria-label="link"
    [attr.baz]="three"></a>`, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `<a
    target="_blank"
    [title]="1"
    [attr.foo]="'one'"
    (customEvent)="doThings()"
    [attr.bar]="'two'"
    [id]="2"
    aria-label="link"
    [attr.baz]="three"></a>`
            }]
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
 * PARTIAL FILE: exclude_bindings_from_consts.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    doThings(): void;
    three: any;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolated_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.name = 'John Doe';
    }
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-app", ngImport: i0, template: `
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d"></div>
    <div attr.title="a{{one}}b{{two}}c"></div>
    <div attr.title="a{{one}}b"></div>
    <div attr.title="{{one}}"></div>
  `, isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: `
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
    <div attr.title="a{{one}}b{{two}}c{{three}}d"></div>
    <div attr.title="a{{one}}b{{two}}c"></div>
    <div attr.title="a{{one}}b"></div>
    <div attr.title="{{one}}"></div>
  `
            }]
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
 * PARTIAL FILE: interpolated_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    name: string;
    one: any;
    two: any;
    three: any;
    four: any;
    five: any;
    six: any;
    seven: any;
    eight: any;
    nine: any;
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

