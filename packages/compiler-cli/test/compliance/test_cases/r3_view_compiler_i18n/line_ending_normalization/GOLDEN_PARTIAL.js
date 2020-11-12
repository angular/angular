/****************************************************************************************************
 * PARTIAL FILE: inline_template_non_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_NON_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_NON_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_NON_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_NON_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_NON_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_NON_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                template: `
<div title="abc
def" i18n-title i18n>
Some Message
{
  value,
  select,
  =0 {
    zero
  }
}</div>`
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
 * PARTIAL FILE: inline_template_non_legacy.d.ts
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
 * PARTIAL FILE: inline_template_non_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_NON_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_NON_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_NON_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_NON_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_NON_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_NON_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                template: `
<div title="abc
def" i18n-title i18n>
Some Message
{
  value,
  select,
  =0 {
    zero
  }
}</div>`
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
 * PARTIAL FILE: inline_template_non_legacy.d.ts
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
 * PARTIAL FILE: external_template_non_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: The template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                templateUrl: 'template.html'
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
 * PARTIAL FILE: external_template_non_legacy.d.ts
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
 * PARTIAL FILE: external_template_non_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_NON_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: The template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                templateUrl: 'template.html'
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
 * PARTIAL FILE: external_template_non_legacy.d.ts
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
 * PARTIAL FILE: inline_template_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `:␟4f9ce2c66b187afd9898b25f6336d1eb2be8b5dc␟7326958852138509669:abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `:␟b5fe162f4e47ab5b3e534491d30b715e0dff0f52␟4863953183043480207:{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `:␟e31c7bc4db2f2e56dc40f005958055a02fd43a2e␟2773178924738647105:
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                template: `
<div title="abc
def" i18n-title i18n>
Some Message
{
  value,
  select,
  =0 {
    zero
  }
}</div>`
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
 * PARTIAL FILE: inline_template_legacy.d.ts
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
 * PARTIAL FILE: inline_template_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$INLINE_TEMPLATE_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `:␟4f9ce2c66b187afd9898b25f6336d1eb2be8b5dc␟7326958852138509669:abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$INLINE_TEMPLATE_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `:␟b5fe162f4e47ab5b3e534491d30b715e0dff0f52␟4863953183043480207:{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$INLINE_TEMPLATE_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `:␟e31c7bc4db2f2e56dc40f005958055a02fd43a2e␟2773178924738647105:
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                template: `
<div title="abc
def" i18n-title i18n>
Some Message
{
  value,
  select,
  =0 {
    zero
  }
}</div>`
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
 * PARTIAL FILE: inline_template_legacy.d.ts
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
 * PARTIAL FILE: external_template_legacy_normalized.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_1;
    }
    else {
        i18n_0 = $localize `:␟4f9ce2c66b187afd9898b25f6336d1eb2be8b5dc␟7326958852138509669:abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_4;
    }
    else {
        i18n_3 = $localize `:␟b5fe162f4e47ab5b3e534491d30b715e0dff0f52␟4863953183043480207:{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_LEGACY_NORMALIZED_TS_5;
    }
    else {
        i18n_2 = $localize `:␟e31c7bc4db2f2e56dc40f005958055a02fd43a2e␟2773178924738647105:
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: The template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                templateUrl: 'template.html'
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
 * PARTIAL FILE: external_template_legacy_normalized.d.ts
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
 * PARTIAL FILE: external_template_legacy.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_LEGACY_TS_1 = goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_LEGACY_TS_1;
    }
    else {
        i18n_0 = $localize `:␟4f9ce2c66b187afd9898b25f6336d1eb2be8b5dc␟7326958852138509669:abc
def`;
    } let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_LEGACY_TS_4 = goog.getMsg("{VAR_SELECT, select, =0 {zero\n  }}");
        i18n_3 = MSG_EXTERNAL_4863953183043480207$$EXTERNAL_TEMPLATE_LEGACY_TS_4;
    }
    else {
        i18n_3 = $localize `:␟70a685282be2d956e4db234fa3d985970672faa0␟4863953183043480207:{VAR_SELECT, select, =0 {zero
  }}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_LEGACY_TS_5 = goog.getMsg("\nSome Message\n{$icu}", { "icu": i18n_3 });
        i18n_2 = MSG_EXTERNAL_2773178924738647105$$EXTERNAL_TEMPLATE_LEGACY_TS_5;
    }
    else {
        i18n_2 = $localize `:␟6a55b51b9bcf8f84b1b868c585ae09949668a72b␟2773178924738647105:
Some Message
${i18n_3}:ICU:`;
    } return [["title", i18n_0], i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                // NOTE: The template has escaped `\r\n` line-endings markers that will be converted to real
                // `\r\n` line-ending chars when loaded from the test file-system.
                templateUrl: 'template.html'
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
 * PARTIAL FILE: external_template_legacy.d.ts
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

