/****************************************************************************************************
 * PARTIAL FILE: meaning_description.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 16, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc descA
         * @meaning meaningA
         */
        const MSG_EXTERNAL_idA$$MEANING_DESCRIPTION_TS_1 = goog.getMsg("Content A");
        i18n_0 = MSG_EXTERNAL_idA$$MEANING_DESCRIPTION_TS_1;
    }
    else {
        i18n_0 = $localize `:meaningA|descA@@idA:Content A`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc descB
         * @meaning meaningB
         */
        const MSG_EXTERNAL_idB$$MEANING_DESCRIPTION_TS_3 = goog.getMsg("Title B");
        i18n_2 = MSG_EXTERNAL_idB$$MEANING_DESCRIPTION_TS_3;
    }
    else {
        i18n_2 = $localize `:meaningB|descB@@idB:Title B`;
    } let i18n_4; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @meaning meaningC
         */
        const MSG_EXTERNAL_6435899732746131543$$MEANING_DESCRIPTION_TS_5 = goog.getMsg("Title C");
        i18n_4 = MSG_EXTERNAL_6435899732746131543$$MEANING_DESCRIPTION_TS_5;
    }
    else {
        i18n_4 = $localize `:meaningC|:Title C`;
    } let i18n_6; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc descD
         * @meaning meaningD
         */
        const MSG_EXTERNAL_5200291527729162531$$MEANING_DESCRIPTION_TS_7 = goog.getMsg("Title D");
        i18n_6 = MSG_EXTERNAL_5200291527729162531$$MEANING_DESCRIPTION_TS_7;
    }
    else {
        i18n_6 = $localize `:meaningD|descD:Title D`;
    } let i18n_8; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc meaningE
         */
        const MSG_EXTERNAL_idE$$MEANING_DESCRIPTION_TS_9 = goog.getMsg("Title E");
        i18n_8 = MSG_EXTERNAL_idE$$MEANING_DESCRIPTION_TS_9;
    }
    else {
        i18n_8 = $localize `:meaningE@@idE:Title E`;
    } let i18n_10; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_idF$$MEANING_DESCRIPTION_TS_11 = goog.getMsg("Title F");
        i18n_10 = MSG_EXTERNAL_idF$$MEANING_DESCRIPTION_TS_11;
    }
    else {
        i18n_10 = $localize `:@@idF:Title F`;
    } let i18n_12; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc [BACKUP_${MESSAGE}_ID:idH]`desc
         */
        const MSG_EXTERNAL_idG$$MEANING_DESCRIPTION_TS_13 = goog.getMsg("Title G");
        i18n_12 = MSG_EXTERNAL_idG$$MEANING_DESCRIPTION_TS_13;
    }
    else {
        i18n_12 = $localize `:[BACKUP_$\{MESSAGE}_ID\:idH]\`desc@@idG:Title G`;
    } let i18n_14; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc Some text \' [BACKUP_MESSAGE_ID: xxx]
         */
        const MSG_EXTERNAL_6499290067750703197$$MEANING_DESCRIPTION_TS_15 = goog.getMsg("Content H");
        i18n_14 = MSG_EXTERNAL_6499290067750703197$$MEANING_DESCRIPTION_TS_15;
    }
    else {
        i18n_14 = $localize `:Some text \\' [BACKUP_MESSAGE_ID\: xxx]:Content H`;
    } return [i18n_0, ["title", i18n_2], ["title", i18n_4], ["title", i18n_6], ["title", i18n_8], ["title", i18n_10], ["title", i18n_12], i18n_14]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div", 1);
        i0.ɵɵtext(3, "Content B");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "div", 2);
        i0.ɵɵtext(5, "Content C");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, "div", 3);
        i0.ɵɵtext(7, "Content D");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(8, "div", 4);
        i0.ɵɵtext(9, "Content E");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(10, "div", 5);
        i0.ɵɵtext(11, "Content F");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(12, "div", 6);
        i0.ɵɵtext(13, "Content G");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(14, "div");
        i0.ɵɵi18n(15, 7);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n="meaningA|descA@@idA">Content A</div>
  <div i18n-title="meaningB|descB@@idB" title="Title B">Content B</div>
  <div i18n-title="meaningC|" title="Title C">Content C</div>
  <div i18n-title="meaningD|descD" title="Title D">Content D</div>
  <div i18n-title="meaningE@@idE" title="Title E">Content E</div>
  <div i18n-title="@@idF" title="Title F">Content F</div>
  <div i18n-title="[BACKUP_$\{MESSAGE}_ID:idH]\`desc@@idG" title="Title G">Content G</div>
  <div i18n="Some text \\' [BACKUP_MESSAGE_ID: xxx]">Content H</div>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: meaning_description.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng-template_basic.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) { }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3902961887793684628$$NG_TEMPLATE_BASIC_TS_1 = goog.getMsg("Hello");
        i18n_0 = MSG_EXTERNAL_3902961887793684628$$NG_TEMPLATE_BASIC_TS_1;
    }
    else {
        i18n_0 = $localize `Hello`;
    } return [["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template i18n-title title="Hello"></ng-template>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng-template_basic.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng-template_structural.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_0_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0, "Test");
} }
function MyComponent_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template", 1);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3902961887793684628$$NG_TEMPLATE_STRUCTURAL_TS__1 = goog.getMsg("Hello");
        i18n_0 = MSG_EXTERNAL_3902961887793684628$$NG_TEMPLATE_STRUCTURAL_TS__1;
    }
    else {
        i18n_0 = $localize `Hello`;
    } return [[4, "ngIf"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_0_Template, 1, 0, undefined, 0);
    } if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.visible);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template *ngIf="visible" i18n-title title="Hello">Test</ng-template>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng-template_structural.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng-template_interpolation.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) { }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3771704108176831903$$NG_TEMPLATE_INTERPOLATION_TS_1 = goog.getMsg("Hello {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_3771704108176831903$$NG_TEMPLATE_INTERPOLATION_TS_1;
    }
    else {
        i18n_0 = $localize `Hello ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [[3, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 0, 0, "ng-template", 0);
        i0.ɵɵi18nAttributes(1, 1);
    } if (rf & 2) {
        i0.ɵɵi18nExp(ctx.name);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template i18n-title title="Hello {{ name }}"></ng-template>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng-template_interpolation.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: ng-template_interpolation_structural.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_0_ng_template_0_Template(rf, ctx) { }
function MyComponent_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 0, 0, "ng-template", 1);
    i0.ɵɵi18nAttributes(1, 2);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.name);
    i0.ɵɵi18nApply(1);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3771704108176831903$$NG_TEMPLATE_INTERPOLATION_STRUCTURAL_TS__1 = goog.getMsg("Hello {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_3771704108176831903$$NG_TEMPLATE_INTERPOLATION_STRUCTURAL_TS__1;
    }
    else {
        i18n_0 = $localize `Hello ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [[4, "ngIf"], [3, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_0_Template, 2, 1, undefined, 0);
    } if (rf & 2) {
        i0.ɵɵproperty("ngIf", true);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template *ngIf="true" i18n-title title="Hello {{ name }}"></ng-template>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: ng-template_interpolation_structural.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: empty_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 0, consts: [["id", "static", "title", ""]], template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div id="static" i18n-title="m|d" title></div>
`
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: empty_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: bound_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 2, consts: [[3, "title"]], template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
    } if (rf & 2) {
        i0.ɵɵproperty("title", ctx.title);
        i0.ɵɵattribute("label", ctx.label);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div
  [title]="title" i18n-title
  [attr.label]="label" i18n-attr.label>
  </div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: bound_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: static_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8809028065680254561$$STATIC_ATTRIBUTES_TS_1 = goog.getMsg("introduction");
        i18n_0 = MSG_EXTERNAL_8809028065680254561$$STATIC_ATTRIBUTES_TS_1;
    }
    else {
        i18n_0 = $localize `:m|d:introduction`;
    } return [["id", "static", "title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div id="static" i18n-title="m|d" title="introduction"></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: static_attributes.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolation_basic.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 5, vars: 8, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_5526535577705876535$$INTERPOLATION_BASIC_TS_1 = goog.getMsg("static text");
        i18n_0 = MSG_EXTERNAL_5526535577705876535$$INTERPOLATION_BASIC_TS_1;
    }
    else {
        i18n_0 = $localize `static text`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8977039798304050198$$INTERPOLATION_BASIC_TS_3 = goog.getMsg("intro {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_2 = MSG_EXTERNAL_8977039798304050198$$INTERPOLATION_BASIC_TS_3;
    }
    else {
        i18n_2 = $localize `:m|d:intro ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } let i18n_4; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d1
         * @meaning m1
         */
        const MSG_EXTERNAL_7432761130955693041$$INTERPOLATION_BASIC_TS_5 = goog.getMsg("{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_4 = MSG_EXTERNAL_7432761130955693041$$INTERPOLATION_BASIC_TS_5;
    }
    else {
        i18n_4 = $localize `:m1|d1:${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } let i18n_6; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d2
         * @meaning m2
         */
        const MSG_EXTERNAL_7566208596013750546$$INTERPOLATION_BASIC_TS_7 = goog.getMsg("{$interpolation} and {$interpolation_1} and again {$interpolation_2}", { "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "interpolation_2": "\uFFFD2\uFFFD" });
        i18n_6 = MSG_EXTERNAL_7566208596013750546$$INTERPOLATION_BASIC_TS_7;
    }
    else {
        i18n_6 = $localize `:m2|d2:${"\uFFFD0\uFFFD"}:INTERPOLATION: and ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: and again ${"\uFFFD2\uFFFD"}:INTERPOLATION_2:`;
    } let i18n_8; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6639222533406278123$$INTERPOLATION_BASIC_TS_9 = goog.getMsg("{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_8 = MSG_EXTERNAL_6639222533406278123$$INTERPOLATION_BASIC_TS_9;
    }
    else {
        i18n_8 = $localize `${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [["id", "dynamic-1", "aria-roledescription", i18n_0, 6, "title", "aria-label"], ["title", i18n_2, "aria-label", i18n_4], ["id", "dynamic-2", 6, "title", "aria-roledescription"], ["title", i18n_6, "aria-roledescription", i18n_8]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵpipe(1, "uppercase");
        i0.ɵɵi18nAttributes(2, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, "div", 2);
        i0.ɵɵi18nAttributes(4, 3);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 6, ctx.valueA))(ctx.valueB);
        i0.ɵɵi18nApply(2);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(ctx.valueA)(ctx.valueB)(ctx.valueA + ctx.valueB)(ctx.valueC);
        i0.ɵɵi18nApply(4);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div id="dynamic-1"
    i18n-title="m|d" title="intro {{ valueA | uppercase }}"
    i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
    i18n-aria-roledescription aria-roledescription="static text"
  ></div>
  <div id="dynamic-2"
    i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
    i18n-aria-roledescription aria-roledescription="{{ valueC }}"
  ></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: interpolation_basic.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolation_custom_config.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 3, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8977039798304050198$$INTERPOLATION_CUSTOM_CONFIG_TS_1 = goog.getMsg("intro {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_8977039798304050198$$INTERPOLATION_CUSTOM_CONFIG_TS_1;
    }
    else {
        i18n_0 = $localize `:m|d:intro ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [[6, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵpipe(1, "uppercase");
        i0.ɵɵi18nAttributes(2, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx.valueA));
        i0.ɵɵi18nApply(2);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n-title="m|d" title="intro {% valueA | uppercase %}"></div>
  `,
                interpolation: ['{%', '%}'],
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: interpolation_custom_config.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolation_nested_context.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵelementStart(1, "div", 1);
    i0.ɵɵpipe(2, "uppercase");
    i0.ɵɵi18nAttributes(3, 2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const outer_r1 = ctx.$implicit;
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 1, outer_r1));
    i0.ɵɵi18nApply(3);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8538466649243975456$$INTERPOLATION_NESTED_CONTEXT_TS__1 = goog.getMsg("different scope {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_8538466649243975456$$INTERPOLATION_NESTED_CONTEXT_TS__1;
    }
    else {
        i18n_0 = $localize `:m|d:different scope ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [[4, "ngFor", "ngForOf"], [6, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", 0);
    } if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.items);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div *ngFor="let outer of items">
    <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
  </div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: interpolation_nested_context.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolation_complex_expressions.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3462388422673575127$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_1 = goog.getMsg("{$interpolation} title", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_3462388422673575127$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_1;
    }
    else {
        i18n_0 = $localize `${"\uFFFD0\uFFFD"}:INTERPOLATION: title`;
    } return [[6, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18nAttributes(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        let tmp_0_0 = null;
        i0.ɵɵi18nExp((tmp_0_0 = ctx.valueA.getRawValue()) == null ? null : tmp_0_0.getTitle());
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n-title title="{{valueA.getRawValue()?.getTitle()}} title"></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: interpolation_complex_expressions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: interpolation_complex_expressions.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3462388422673575127$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_1 = goog.getMsg("{$interpolation} title", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_3462388422673575127$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_1;
    }
    else {
        i18n_0 = $localize `${"\uFFFD0\uFFFD"}:INTERPOLATION: title`;
    } return [[6, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18nAttributes(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        let tmp_0_0 = null;
        i0.ɵɵi18nExp((tmp_0_0 = ctx.valueA.getRawValue()) == null ? null : tmp_0_0.getTitle());
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n-title title="{{valueA.getRawValue()?.getTitle()}} title"></div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: interpolation_complex_expressions.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: i18n_root_node.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_7727043314656808423$$I18N_ROOT_NODE_TS_1 = goog.getMsg("Element title");
        i18n_0 = MSG_EXTERNAL_7727043314656808423$$I18N_ROOT_NODE_TS_1;
    }
    else {
        i18n_0 = $localize `:m|d:Element title`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4969674997806975147$$I18N_ROOT_NODE_TS_3 = goog.getMsg("Some content");
        i18n_2 = MSG_EXTERNAL_4969674997806975147$$I18N_ROOT_NODE_TS_3;
    }
    else {
        i18n_2 = $localize `Some content`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n i18n-title="m|d" title="Element title">Some content</div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: i18n_root_node.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

/****************************************************************************************************
 * PARTIAL FILE: invalid_i18n_meta.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_INVALID_I18N_META_TS_1 = goog.getMsg("Element title");
        i18n_0 = MSG_INVALID_I18N_META_TS_1;
    }
    else {
        i18n_0 = $localize `:@@ID.WITH.INVALID.CHARS:Element title`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_INVALID_I18N_META_TS_3 = goog.getMsg(" Some content ");
        i18n_2 = MSG_INVALID_I18N_META_TS_3;
    }
    else {
        i18n_2 = $localize `:@@ID.WITH.INVALID.CHARS.2: Some content `;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n="@@ID.WITH.INVALID.CHARS.2" i18n-title="@@ID.WITH.INVALID.CHARS" title="Element title">
    Some content
  </div>
  `
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: invalid_i18n_meta.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

