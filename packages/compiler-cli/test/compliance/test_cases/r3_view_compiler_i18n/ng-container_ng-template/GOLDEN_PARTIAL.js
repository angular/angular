/****************************************************************************************************
 * PARTIAL FILE: single_ng-container.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 3, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_355394464191978948$$SINGLE_NG_CONTAINER_TS_1 = goog.getMsg("Some content: {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_355394464191978948$$SINGLE_NG_CONTAINER_TS_1;
    }
    else {
        i18n_0 = $localize `Some content: ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementContainerStart(0);
        i0.ɵɵi18n(1, 0);
        i0.ɵɵpipe(2, "uppercase");
        i0.ɵɵelementContainerEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 1, ctx.valueA));
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-container i18n>Some content: {{ valueA | uppercase }}</ng-container>
`,
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
 * PARTIAL FILE: single_ng-container.d.ts
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
 * PARTIAL FILE: single_ng-template.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18n(0, 0);
    i0.ɵɵpipe(1, "uppercase");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_355394464191978948$$SINGLE_NG_TEMPLATE_TS__1 = goog.getMsg("Some content: {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_355394464191978948$$SINGLE_NG_TEMPLATE_TS__1;
    }
    else {
        i18n_0 = $localize `Some content: ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 2, 3, "ng-template");
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template i18n>Some content: {{ valueA | uppercase }}</ng-template>
`,
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
 * PARTIAL FILE: single_ng-template.d.ts
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
 * PARTIAL FILE: child_elements.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
    i0.ɵɵpipe(1, "uppercase");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 5, vars: 3, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_321671710121172402$$CHILD_ELEMENTS_TS__1 = goog.getMsg("{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}", { "startTagNgTemplate": "\uFFFD*2:1\uFFFD", "closeTagNgTemplate": "\uFFFD/*2:1\uFFFD", "startTagNgContainer": "\uFFFD#3\uFFFD", "interpolation_1": "\uFFFD0\uFFFD", "closeTagNgContainer": "\uFFFD/#3\uFFFD", "interpolation": "\uFFFD0:1\uFFFD" });
        i18n_0 = MSG_EXTERNAL_321671710121172402$$CHILD_ELEMENTS_TS__1;
    }
    else {
        i18n_0 = $localize `${"\uFFFD*2:1\uFFFD"}:START_TAG_NG_TEMPLATE:Template content: ${"\uFFFD0:1\uFFFD"}:INTERPOLATION:${"\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_NG_TEMPLATE:${"\uFFFD#3\uFFFD"}:START_TAG_NG_CONTAINER:Container content: ${"\uFFFD0\uFFFD"}:INTERPOLATION_1:${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_NG_CONTAINER:`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 2, 3, "ng-template");
        i0.ɵɵelementContainer(3);
        i0.ɵɵpipe(4, "uppercase");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(4, 1, ctx.valueB));
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    <ng-template>Template content: {{ valueA | uppercase }}</ng-template>
    <ng-container>Container content: {{ valueB | uppercase }}</ng-container>
  </div>
`,
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
 * PARTIAL FILE: child_elements.d.ts
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
 * PARTIAL FILE: bare_icus.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18n(0, 1);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.gender);
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8806993169187953163$$BARE_ICUS_TS_1 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        i18n_0 = MSG_EXTERNAL_8806993169187953163$$BARE_ICUS_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$BARE_ICUS_TS__3 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_2 = MSG_EXTERNAL_7842238767399919809$$BARE_ICUS_TS__3;
    }
    else {
        i18n_2 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_2 = i0.ɵɵi18nPostprocess(i18n_2, { "VAR_SELECT": "\uFFFD0\uFFFD" }); return [i18n_0, i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_ng_template_0_Template, 1, 1, "ng-template");
        i0.ɵɵelementContainerStart(1);
        i0.ɵɵi18n(2, 0);
        i0.ɵɵelementContainerEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.age);
        i0.ɵɵi18nApply(2);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template>{gender, select, male {male} female {female} other {other}}</ng-template>
  <ng-container>{age, select, 10 {ten} 20 {twenty} other {other}}</ng-container>
`,
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
 * PARTIAL FILE: bare_icus.d.ts
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
 * PARTIAL FILE: nested_templates.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_2_ng_template_2_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18n(0, 0, 3);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵi18nExp(ctx_r2.valueC);
    i0.ɵɵi18nApply(0);
} }
function MyComponent_ng_template_2_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵtemplate(1, MyComponent_ng_template_2_ng_template_2_ng_template_1_Template, 1, 1, "ng-template");
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(ctx_r1.valueB);
    i0.ɵɵi18nApply(0);
} }
function MyComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵpipe(1, "uppercase");
    i0.ɵɵtemplate(2, MyComponent_ng_template_2_ng_template_2_Template, 2, 1, "ng-template");
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4054819503343192023$$NESTED_TEMPLATES_TS__1 = goog.getMsg("{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}", { "startTagNgTemplate": "[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]", "closeTagNgTemplate": "[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]", "interpolation": "\uFFFD0:1\uFFFD", "interpolation_1": "\uFFFD0:2\uFFFD", "interpolation_2": "\uFFFD0:3\uFFFD" });
        i18n_0 = MSG_EXTERNAL_4054819503343192023$$NESTED_TEMPLATES_TS__1;
    }
    else {
        i18n_0 = $localize `${"[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"}:START_TAG_NG_TEMPLATE: Template A: ${"\uFFFD0:1\uFFFD"}:INTERPOLATION: ${"[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"}:START_TAG_NG_TEMPLATE: Template B: ${"\uFFFD0:2\uFFFD"}:INTERPOLATION_1: ${"[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"}:START_TAG_NG_TEMPLATE: Template C: ${"\uFFFD0:3\uFFFD"}:INTERPOLATION_2: ${"[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:${"[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:${"[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 3, 3, "ng-template");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    <ng-template>
      Template A: {{ valueA | uppercase }}
      <ng-template>
        Template B: {{ valueB }}
        <ng-template>
          Template C: {{ valueC }}
        </ng-template>
      </ng-template>
    </ng-template>
  </div>
`,
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
 * PARTIAL FILE: nested_templates.d.ts
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
 * PARTIAL FILE: icus.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18n(0, 1);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.age);
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$ICUS_TS_1 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$ICUS_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8806993169187953163$$ICUS_TS__3 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        i18n_2 = MSG_EXTERNAL_8806993169187953163$$ICUS_TS__3;
    }
    else {
        i18n_2 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}`;
    } i18n_2 = i0.ɵɵi18nPostprocess(i18n_2, { "VAR_SELECT": "\uFFFD0\uFFFD" }); return [i18n_0, i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementContainerStart(0);
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementContainerEnd();
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 1, 1, "ng-template");
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.gender);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-container i18n>{gender, select, male {male} female {female} other {other}}</ng-container>
  <ng-template i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</ng-template>
`,
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
 * PARTIAL FILE: icus.d.ts
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
 * PARTIAL FILE: self_closing_tags.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 2);
    i0.ɵɵelement(1, "img", 1);
    i0.ɵɵi18nEnd();
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 4, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_5420441640329771391$$SELF_CLOSING_TAGS_TS_1 = goog.getMsg("{$tagImg} is my logo #1 ", { "tagImg": "\uFFFD#2\uFFFD\uFFFD/#2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_5420441640329771391$$SELF_CLOSING_TAGS_TS_1;
    }
    else {
        i18n_0 = $localize `${"\uFFFD#2\uFFFD\uFFFD/#2\uFFFD"}:TAG_IMG: is my logo #1 `;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2178806453879858557$$SELF_CLOSING_TAGS_TS__3 = goog.getMsg("{$tagImg} is my logo #2 ", { "tagImg": "\uFFFD#1\uFFFD\uFFFD/#1\uFFFD" });
        i18n_2 = MSG_EXTERNAL_2178806453879858557$$SELF_CLOSING_TAGS_TS__3;
    }
    else {
        i18n_2 = $localize `${"\uFFFD#1\uFFFD\uFFFD/#1\uFFFD"}:TAG_IMG: is my logo #2 `;
    } return [i18n_0, ["src", "logo.png", "title", "Logo"], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementContainerStart(0);
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "img", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementContainerEnd();
        i0.ɵɵtemplate(3, MyComponent_ng_template_3_Template, 2, 0, "ng-template");
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-container i18n>
    <img src="logo.png" title="Logo" /> is my logo #1
  </ng-container>
  <ng-template i18n>
    <img src="logo.png" title="Logo" /> is my logo #2
  </ng-template>
`,
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
 * PARTIAL FILE: self_closing_tags.d.ts
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
 * PARTIAL FILE: duplicate_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 4, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6563391987554512024$$DUPLICATE_CONTENT_TS_1 = goog.getMsg("Test");
        i18n_0 = MSG_EXTERNAL_6563391987554512024$$DUPLICATE_CONTENT_TS_1;
    }
    else {
        i18n_0 = $localize `Test`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6563391987554512024$$DUPLICATE_CONTENT_TS_3 = goog.getMsg("Test");
        i18n_2 = MSG_EXTERNAL_6563391987554512024$$DUPLICATE_CONTENT_TS_3;
    }
    else {
        i18n_2 = $localize `Test`;
    } return [i18n_0, i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div");
        i0.ɵɵi18n(3, 1);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>Test</div>
  <div i18n>Test</div>
`,
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
 * PARTIAL FILE: duplicate_content.d.ts
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
 * PARTIAL FILE: self_closing_ng-container.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_5918426009610945623$$SELF_CLOSING_NG_CONTAINER_TS_1 = goog.getMsg(" Hello {$startTagNgContainer}there{$closeTagNgContainer}", { "startTagNgContainer": "\uFFFD#2\uFFFD", "closeTagNgContainer": "\uFFFD/#2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_5918426009610945623$$SELF_CLOSING_NG_CONTAINER_TS_1;
    }
    else {
        i18n_0 = $localize ` Hello ${"\uFFFD#2\uFFFD"}:START_TAG_NG_CONTAINER:there${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_NG_CONTAINER:`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementContainer(2);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    Hello <ng-container>there</ng-container>
  </div>
`,
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
 * PARTIAL FILE: self_closing_ng-container.d.ts
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
 * PARTIAL FILE: ng-container_with_non_text_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 4, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_5421724224363734696$$NG_CONTAINER_WITH_NON_TEXT_CONTENT_TS_1 = goog.getMsg(" Hello {$startTagNgContainer}there {$startTagStrong}!{$closeTagStrong}{$closeTagNgContainer}", { "startTagNgContainer": "\uFFFD#2\uFFFD", "startTagStrong": "\uFFFD#3\uFFFD", "closeTagStrong": "\uFFFD/#3\uFFFD", "closeTagNgContainer": "\uFFFD/#2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_5421724224363734696$$NG_CONTAINER_WITH_NON_TEXT_CONTENT_TS_1;
    }
    else {
        i18n_0 = $localize ` Hello ${"\uFFFD#2\uFFFD"}:START_TAG_NG_CONTAINER:there ${"\uFFFD#3\uFFFD"}:START_TAG_STRONG:!${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_STRONG:${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_NG_CONTAINER:`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementContainerStart(2);
        i0.ɵɵelement(3, "strong");
        i0.ɵɵelementContainerEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    Hello <ng-container>there <strong>!</strong></ng-container>
  </div>
`,
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
 * PARTIAL FILE: ng-container_with_non_text_content.d.ts
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
 * PARTIAL FILE: structural_directives.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_0_ng_template_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18n(0, 1);
} }
function MyComponent_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 1, 0, "ng-template");
} }
function MyComponent_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵi18n(1, 2);
    i0.ɵɵelementContainerEnd();
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3308216566145348998$$STRUCTURAL_DIRECTIVES_TS___1 = goog.getMsg("Content A");
        i18n_0 = MSG_EXTERNAL_3308216566145348998$$STRUCTURAL_DIRECTIVES_TS___1;
    }
    else {
        i18n_0 = $localize `Content A`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8349021389088127654$$STRUCTURAL_DIRECTIVES_TS__3 = goog.getMsg("Content B");
        i18n_2 = MSG_EXTERNAL_8349021389088127654$$STRUCTURAL_DIRECTIVES_TS__3;
    }
    else {
        i18n_2 = $localize `Content B`;
    } return [[4, "ngIf"], i18n_0, i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_0_Template, 1, 0, undefined, 0);
        i0.ɵɵtemplate(1, MyComponent_ng_container_1_Template, 2, 0, "ng-container", 0);
    } if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.someFlag);
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("ngIf", ctx.someFlag);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <ng-template *ngIf="someFlag" i18n>Content A</ng-template>
  <ng-container *ngIf="someFlag" i18n>Content B</ng-container>
`,
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
 * PARTIAL FILE: structural_directives.d.ts
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

