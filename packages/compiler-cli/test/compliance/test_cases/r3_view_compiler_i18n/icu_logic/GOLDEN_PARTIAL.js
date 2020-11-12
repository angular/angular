/****************************************************************************************************
 * PARTIAL FILE: single_icu.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$SINGLE_ICU_TS_1 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$SINGLE_ICU_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
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
  <div i18n>{gender, select, male {male} female {female} other {other}}</div>
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
 * PARTIAL FILE: single_icu.d.ts
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
 * PARTIAL FILE: escape_quotes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4166854826696768832$$ESCAPE_QUOTES_TS_1 = goog.getMsg("{VAR_SELECT, select, single {'single quotes'} double {\"double quotes\"} other {other}}");
        i18n_0 = MSG_EXTERNAL_4166854826696768832$$ESCAPE_QUOTES_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, single {'single quotes'} double {"double quotes"} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
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
  <div i18n>{gender, select, single {'single quotes'} double {"double quotes"} other {other}}</div>
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
 * PARTIAL FILE: escape_quotes.d.ts
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
 * PARTIAL FILE: icu_only.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8806993169187953163$$ICU_ONLY_TS_1 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        i18n_0 = MSG_EXTERNAL_8806993169187953163$$ICU_ONLY_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵi18n(0, 0);
    } if (rf & 2) {
        i0.ɵɵi18nExp(ctx.age);
        i0.ɵɵi18nApply(0);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  {age, select, 10 {ten} 20 {twenty} other {other}}
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
 * PARTIAL FILE: icu_only.d.ts
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
 * PARTIAL FILE: bare_icu.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵtext(1, " ");
    i0.ɵɵi18n(2, 4);
    i0.ɵɵtext(3, " ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.age);
    i0.ɵɵi18nApply(2);
} }
function MyComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵtext(1, " You have ");
    i0.ɵɵi18n(2, 6);
    i0.ɵɵtext(3, ". ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r1.count)(ctx_r1.count);
    i0.ɵɵi18nApply(2);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 4, vars: 3, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$BARE_ICU_TS_1 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$BARE_ICU_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8806993169187953163$$BARE_ICU_TS__3 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}");
        i18n_2 = MSG_EXTERNAL_8806993169187953163$$BARE_ICU_TS__3;
    }
    else {
        i18n_2 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}`;
    } i18n_2 = i0.ɵɵi18nPostprocess(i18n_2, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_4; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_1922743304863699161$$BARE_ICU_TS__5 = goog.getMsg("{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}");
        i18n_4 = MSG_EXTERNAL_1922743304863699161$$BARE_ICU_TS__5;
    }
    else {
        i18n_4 = $localize `{VAR_SELECT, select, 0 {no emails} 1 {one email} other {{INTERPOLATION} emails}}`;
    } i18n_4 = i0.ɵɵi18nPostprocess(i18n_4, { "VAR_SELECT": "\uFFFD0\uFFFD", "INTERPOLATION": "\uFFFD1\uFFFD" }); return [i18n_0, ["title", "icu only", 4, "ngIf"], ["title", "icu and text", 4, "ngIf"], ["title", "icu only"], i18n_2, ["title", "icu and text"], i18n_4]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 4, 1, "div", 1);
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 4, 2, "div", 2);
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.gender);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("ngIf", ctx.available);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div>{gender, select, male {male} female {female} other {other}}</div>
  <div *ngIf="visible" title="icu only">
    {age, select, 10 {ten} 20 {twenty} other {other}}
  </div>
  <div *ngIf="available" title="icu and text">
    You have {count, select, 0 {no emails} 1 {one email} other {{{count}} emails}}.
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
 * PARTIAL FILE: bare_icu.d.ts
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
 * PARTIAL FILE: custom_interpolation.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2949673783721159566$$CUSTOM_INTERPOLATION_TS_1 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} other {{INTERPOLATION}}}");
        i18n_0 = MSG_EXTERNAL_2949673783721159566$$CUSTOM_INTERPOLATION_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} other {{INTERPOLATION}}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD", "INTERPOLATION": "\uFFFD1\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.age)(ctx.other);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>{age, select, 10 {ten} 20 {twenty} other {{% other %}}}</div>
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
 * PARTIAL FILE: custom_interpolation.d.ts
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
 * PARTIAL FILE: html_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 5, vars: 1, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2417296354340576868$$HTML_CONTENT_TS_2 = goog.getMsg("{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}");
        i18n_1 = MSG_EXTERNAL_2417296354340576868$$HTML_CONTENT_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT, select, male {male - {START_BOLD_TEXT}male{CLOSE_BOLD_TEXT}} female {female {START_BOLD_TEXT}female{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}{START_ITALIC_TEXT}other{CLOSE_ITALIC_TEXT}{CLOSE_TAG_DIV}}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD", "START_BOLD_TEXT": "<b>", "CLOSE_BOLD_TEXT": "</b>", "START_ITALIC_TEXT": "<i>", "CLOSE_ITALIC_TEXT": "</i>", "START_TAG_DIV": "<div class=\"other\">", "CLOSE_TAG_DIV": "</div>" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2500076286225379125$$HTML_CONTENT_TS_3 = goog.getMsg(" {$icu} {$startBoldText}Other content{$closeBoldText}{$startTagDiv}{$startItalicText}Another content{$closeItalicText}{$closeTagDiv}", { "startBoldText": "\uFFFD#2\uFFFD", "closeBoldText": "\uFFFD/#2\uFFFD", "startTagDiv": "\uFFFD#3\uFFFD", "startItalicText": "\uFFFD#4\uFFFD", "closeItalicText": "\uFFFD/#4\uFFFD", "closeTagDiv": "\uFFFD/#3\uFFFD", "icu": i18n_1 });
        i18n_0 = MSG_EXTERNAL_2500076286225379125$$HTML_CONTENT_TS_3;
    }
    else {
        i18n_0 = $localize ` ${i18n_1}:ICU: ${"\uFFFD#2\uFFFD"}:START_BOLD_TEXT:Other content${"\uFFFD/#2\uFFFD"}:CLOSE_BOLD_TEXT:${"\uFFFD#3\uFFFD"}:START_TAG_DIV:${"\uFFFD#4\uFFFD"}:START_ITALIC_TEXT:Another content${"\uFFFD/#4\uFFFD"}:CLOSE_ITALIC_TEXT:${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_DIV:`;
    } return [i18n_0, [1, "other"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "b");
        i0.ɵɵelementStart(3, "div", 1);
        i0.ɵɵelement(4, "i");
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(ctx.gender);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {gender, select, male {male - <b>male</b>} female {female <b>female</b>} other {<div class="other"><i>other</i></div>}}
    <b>Other content</b>
    <div class="other"><i>Another content</i></div>
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
 * PARTIAL FILE: html_content.d.ts
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
 * PARTIAL FILE: expressions.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6879461626778511059$$EXPRESSIONS_TS_1 = goog.getMsg("{VAR_SELECT, select, male {male of age: {INTERPOLATION}} female {female} other {other}}");
        i18n_0 = MSG_EXTERNAL_6879461626778511059$$EXPRESSIONS_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, male {male of age: {INTERPOLATION}} female {female} other {other}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD", "INTERPOLATION": "\uFFFD1\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.gender)(ctx.ageA + ctx.ageB + ctx.ageC);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>{gender, select, male {male of age: {{ ageA + ageB + ageC }}} female {female} other {other}}</div>
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
 * PARTIAL FILE: expressions.d.ts
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
 * PARTIAL FILE: multiple_icus.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$MULTIPLE_ICUS_TS_2 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_1 = MSG_EXTERNAL_7842238767399919809$$MULTIPLE_ICUS_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7068143081688428291$$MULTIPLE_ICUS_TS_4 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        i18n_3 = MSG_EXTERNAL_7068143081688428291$$MULTIPLE_ICUS_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_692449625378653608$$MULTIPLE_ICUS_TS_5 = goog.getMsg(" {$icu} {$icu_1} ", { "icu": i18n_1, "icu_1": i18n_3 });
        i18n_0 = MSG_EXTERNAL_692449625378653608$$MULTIPLE_ICUS_TS_5;
    }
    else {
        i18n_0 = $localize ` ${i18n_1}:ICU: ${i18n_3}:ICU_1: `;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.gender)(ctx.age);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {gender, select, male {male} female {female} other {other}}
    {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}
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
 * PARTIAL FILE: multiple_icus.d.ts
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
 * PARTIAL FILE: shared_placeholder.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(ctx_r0.gender);
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 4, vars: 3, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_2 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_1 = MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_4 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_3 = MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD1\uFFFD" }); let i18n_5; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS__6 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_5 = MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS__6;
    }
    else {
        i18n_5 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_5 = i0.ɵɵi18nPostprocess(i18n_5, { "VAR_SELECT": "\uFFFD0:1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_795316458693634260$$SHARED_PLACEHOLDER_TS__7 = goog.getMsg(" {$icu} {$startTagDiv} {$icu} {$closeTagDiv}{$startTagDiv_1} {$icu} {$closeTagDiv}", { "startTagDiv": "\uFFFD#2\uFFFD", "closeTagDiv": "[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]", "startTagDiv_1": "\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD", "icu": "\uFFFDI18N_EXP_ICU\uFFFD" });
        i18n_0 = MSG_EXTERNAL_795316458693634260$$SHARED_PLACEHOLDER_TS__7;
    }
    else {
        i18n_0 = $localize ` ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU: ${"\uFFFD#2\uFFFD"}:START_TAG_DIV: ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU: ${"[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]"}:CLOSE_TAG_DIV:${"\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_DIV_1: ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU: ${"[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]"}:CLOSE_TAG_DIV:`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "ICU": [i18n_1, i18n_3, i18n_5] }); return [i18n_0, [4, "ngIf"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "div");
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 2, 1, "div", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵi18nExp(ctx.gender)(ctx.gender);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {gender, select, male {male} female {female} other {other}}
    <div>
      {gender, select, male {male} female {female} other {other}}
    </div>
    <div *ngIf="visible">
      {gender, select, male {male} female {female} other {other}}
    </div>
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
 * PARTIAL FILE: shared_placeholder.d.ts
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
 * PARTIAL FILE: nested_icus.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_343563413083115114$$NESTED_ICUS_TS_2 = goog.getMsg("{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}");
        i18n_1 = MSG_EXTERNAL_343563413083115114$$NESTED_ICUS_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD", "VAR_SELECT_1": "\uFFFD1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_1913020609154054897$$NESTED_ICUS_TS_3 = goog.getMsg(" {$icu} ", { "icu": i18n_1 });
        i18n_0 = MSG_EXTERNAL_1913020609154054897$$NESTED_ICUS_TS_3;
    }
    else {
        i18n_0 = $localize ` ${i18n_1}:ICU: `;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.age)(ctx.gender);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {gender, select,
      male {male of age: {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}}
      female {female}
      other {other}
    }
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
 * PARTIAL FILE: nested_icus.d.ts
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
 * PARTIAL FILE: nested_icu_in_other_block.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 3, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6870293071705078389$$NESTED_ICU_IN_OTHER_BLOCK_TS_1 = goog.getMsg("{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}");
        i18n_0 = MSG_EXTERNAL_6870293071705078389$$NESTED_ICU_IN_OTHER_BLOCK_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}} !} other {other - {INTERPOLATION}}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD", "VAR_PLURAL": "\uFFFD1\uFFFD", "INTERPOLATION": "\uFFFD2\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.name)(ctx.count)(ctx.count);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>{count, plural,
    =0 {zero}
    =2 {{{count}} {name, select,
          cat {cats}
          dog {dogs}
          other {animals}} !}
    other {other - {{count}}}
  }</div>
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
 * PARTIAL FILE: nested_icu_in_other_block.d.ts
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
 * PARTIAL FILE: different_contexts.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(ctx_r0.age);
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 2, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7842238767399919809$$DIFFERENT_CONTEXTS_TS_2 = goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_1 = MSG_EXTERNAL_7842238767399919809$$DIFFERENT_CONTEXTS_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT, select, male {male} female {female} other {other}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7068143081688428291$$DIFFERENT_CONTEXTS_TS__4 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        i18n_3 = MSG_EXTERNAL_7068143081688428291$$DIFFERENT_CONTEXTS_TS__4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0:1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6305631112932538342$$DIFFERENT_CONTEXTS_TS__5 = goog.getMsg(" {$icu} {$startTagSpan} {$icu_1} {$closeTagSpan}", { "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD", "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD", "icu": i18n_1, "icu_1": i18n_3 });
        i18n_0 = MSG_EXTERNAL_6305631112932538342$$DIFFERENT_CONTEXTS_TS__5;
    }
    else {
        i18n_0 = $localize ` ${i18n_1}:ICU: ${"\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_SPAN: ${i18n_3}:ICU_1: ${"\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_SPAN:`;
    } return [i18n_0, [4, "ngIf"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 1, "span", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.ageVisible);
        i0.ɵɵi18nExp(ctx.gender);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
  {gender, select, male {male} female {female} other {other}}
  <span *ngIf="ageVisible">
    {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}
  </span>
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
 * PARTIAL FILE: different_contexts.d.ts
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
 * PARTIAL FILE: icu_with_interpolations.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_span_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(1);
    i0.ɵɵi18nExp(ctx_r0.age)(ctx_r0.otherAge);
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 4, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7825031864601787094$$ICU_WITH_INTERPOLATIONS_TS_2 = goog.getMsg("{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}");
        i18n_1 = MSG_EXTERNAL_7825031864601787094$$ICU_WITH_INTERPOLATIONS_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD", "INTERPOLATION": "\uFFFD1\uFFFD", "INTERPOLATION_1": "\uFFFD2\uFFFD" }); let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2310343208266678305$$ICU_WITH_INTERPOLATIONS_TS__4 = goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}");
        i18n_3 = MSG_EXTERNAL_2310343208266678305$$ICU_WITH_INTERPOLATIONS_TS__4;
    }
    else {
        i18n_3 = $localize `{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_SELECT": "\uFFFD0:1\uFFFD", "INTERPOLATION": "\uFFFD1:1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_7229970708438032491$$ICU_WITH_INTERPOLATIONS_TS__5 = goog.getMsg(" {$icu} {$startTagSpan} {$icu_1} {$closeTagSpan}", { "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD", "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD", "icu": i18n_1, "icu_1": i18n_3 });
        i18n_0 = MSG_EXTERNAL_7229970708438032491$$ICU_WITH_INTERPOLATIONS_TS__5;
    }
    else {
        i18n_0 = $localize ` ${i18n_1}:ICU: ${"\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_SPAN: ${i18n_3}:ICU_1: ${"\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_SPAN:`;
    } return [i18n_0, [4, "ngIf"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 2, "span", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.ageVisible);
        i0.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {gender, select, male {male {{ weight }}} female {female {{ height }}} other {other}}
    <span *ngIf="ageVisible">
      {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {{ otherAge }}}}
    </span>
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
 * PARTIAL FILE: icu_with_interpolations.d.ts
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
 * PARTIAL FILE: named_interpolations.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 4, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6318060397235942326$$NAMED_INTERPOLATIONS_TS_1 = goog.getMsg("{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}");
        i18n_0 = MSG_EXTERNAL_6318060397235942326$$NAMED_INTERPOLATIONS_TS_1;
    }
    else {
        i18n_0 = $localize `{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD", "PH_A": "\uFFFD1\uFFFD", "PH_B": "\uFFFD2\uFFFD", "PH_WITH_SPACES": "\uFFFD3\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height)(ctx.age);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>{
    gender,
    select,
      male {male {{ weight // i18n(ph="PH_A") }}}
      female {female {{ height // i18n(ph="PH_B") }}}
      other {other {{ age // i18n(ph="PH WITH SPACES") }}}
  }</div>
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
 * PARTIAL FILE: named_interpolations.d.ts
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
 * PARTIAL FILE: metadata.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc descA
         * @meaning meaningA
         */
        const MSG_EXTERNAL_idA$$METADATA_TS_1 = goog.getMsg("{VAR_SELECT, select, 1 {one} other {more than one}}");
        i18n_0 = MSG_EXTERNAL_idA$$METADATA_TS_1;
    }
    else {
        i18n_0 = $localize `:meaningA|descA@@idA:{VAR_SELECT, select, 1 {one} other {more than one}}`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" }); return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.count);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n="meaningA|descA@@idA">{count, select, 1 {one} other {more than one}}</div>
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
 * PARTIAL FILE: metadata.d.ts
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
 * PARTIAL FILE: keyword_spaces.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_199763560911211963$$KEYWORD_SPACES_TS_2 = goog.getMsg("{VAR_SELECT , select , 1 {one} other {more than one}}");
        i18n_1 = MSG_EXTERNAL_199763560911211963$$KEYWORD_SPACES_TS_2;
    }
    else {
        i18n_1 = $localize `{VAR_SELECT , select , 1 {one} other {more than one}}`;
    } i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD" }); let i18n_3; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3383986062053865025$$KEYWORD_SPACES_TS_4 = goog.getMsg("{VAR_PLURAL , plural , =1 {one} other {more than one}}");
        i18n_3 = MSG_EXTERNAL_3383986062053865025$$KEYWORD_SPACES_TS_4;
    }
    else {
        i18n_3 = $localize `{VAR_PLURAL , plural , =1 {one} other {more than one}}`;
    } i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "VAR_PLURAL": "\uFFFD1\uFFFD" }); let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6804521423144261079$$KEYWORD_SPACES_TS_5 = goog.getMsg(" {$icu} {$icu_1} ", { "icu": i18n_1, "icu_1": i18n_3 });
        i18n_0 = MSG_EXTERNAL_6804521423144261079$$KEYWORD_SPACES_TS_5;
    }
    else {
        i18n_0 = $localize ` ${i18n_1}:ICU: ${i18n_3}:ICU_1: `;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.count)(ctx.count);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {count, select , 1 {one} other {more than one}}
    {count, plural , =1 {one} other {more than one}}
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
 * PARTIAL FILE: keyword_spaces.d.ts
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

