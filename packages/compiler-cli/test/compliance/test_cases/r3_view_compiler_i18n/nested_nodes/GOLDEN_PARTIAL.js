/****************************************************************************************************
 * PARTIAL FILE: empty_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 0, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelement(0, "div");
        i0.ɵɵelement(1, "div");
        i0.ɵɵelement(2, "div");
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n></div>
  <div i18n>  </div>
  <div i18n>

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
 * PARTIAL FILE: empty_content.d.ts
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
 * PARTIAL FILE: comments_in_translated_text.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3784161717320915177$$COMMENTS_IN_TRANSLATED_TEXT_TS_1 = goog.getMsg("Some  text");
        i18n_0 = MSG_EXTERNAL_3784161717320915177$$COMMENTS_IN_TRANSLATED_TEXT_TS_1;
    }
    else {
        i18n_0 = $localize `Some  text`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>Some <!-- comments --> text</div>
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
 * PARTIAL FILE: comments_in_translated_text.d.ts
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
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6706932755599817741$$ESCAPE_QUOTES_TS_1 = goog.getMsg("Some text 'with single quotes', \"with double quotes\", `with backticks` and without quotes.");
        i18n_0 = MSG_EXTERNAL_6706932755599817741$$ESCAPE_QUOTES_TS_1;
    }
    else {
        i18n_0 = $localize `Some text 'with single quotes', "with double quotes", \`with backticks\` and without quotes.`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>Some text 'with single quotes', "with double quotes", \`with backticks\` and without quotes.</div>
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
 * PARTIAL FILE: backtick_quotes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6063854695944501059$$BACKTICK_QUOTES_TS_1 = goog.getMsg("`{$interpolation}`", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_6063854695944501059$$BACKTICK_QUOTES_TS_1;
    }
    else {
        i18n_0 = $localize `\`${"\uFFFD0\uFFFD"}:INTERPOLATION:\``;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
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
                template: '<div i18n>`{{ count }}`</div>',
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
 * PARTIAL FILE: backtick_quotes.d.ts
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
 * PARTIAL FILE: plain_text_messages.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 10, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4890179241114413722$$PLAIN_TEXT_MESSAGES_TS_1 = goog.getMsg("My i18n block #1");
        i18n_0 = MSG_EXTERNAL_4890179241114413722$$PLAIN_TEXT_MESSAGES_TS_1;
    }
    else {
        i18n_0 = $localize `My i18n block #1`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2413150872298537152$$PLAIN_TEXT_MESSAGES_TS_3 = goog.getMsg("My i18n block #2");
        i18n_2 = MSG_EXTERNAL_2413150872298537152$$PLAIN_TEXT_MESSAGES_TS_3;
    }
    else {
        i18n_2 = $localize `My i18n block #2`;
    } let i18n_4; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_5023003143537152794$$PLAIN_TEXT_MESSAGES_TS_5 = goog.getMsg("My i18n block #3");
        i18n_4 = MSG_EXTERNAL_5023003143537152794$$PLAIN_TEXT_MESSAGES_TS_5;
    }
    else {
        i18n_4 = $localize `My i18n block #3`;
    } return [i18n_0, i18n_2, i18n_4]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div");
        i0.ɵɵtext(3, "My non-i18n block #1");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "div");
        i0.ɵɵi18n(5, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, "div");
        i0.ɵɵtext(7, "My non-i18n block #2");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(8, "div");
        i0.ɵɵi18n(9, 2);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>My i18n block #1</div>
  <div>My non-i18n block #1</div>
  <div i18n>My i18n block #2</div>
  <div>My non-i18n block #2</div>
  <div i18n>My i18n block #3</div>
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
 * PARTIAL FILE: plain_text_messages.d.ts
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
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 2, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8886186367501632276$$NAMED_INTERPOLATIONS_TS_1 = goog.getMsg(" Named interpolation: {$phA} Named interpolation with spaces: {$phB} ", { "phA": "\uFFFD0\uFFFD", "phB": "\uFFFD1\uFFFD" });
        i18n_0 = MSG_EXTERNAL_8886186367501632276$$NAMED_INTERPOLATIONS_TS_1;
    }
    else {
        i18n_0 = $localize ` Named interpolation: ${"\uFFFD0\uFFFD"}:PH_A: Named interpolation with spaces: ${"\uFFFD1\uFFFD"}:PH_B: `;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.valueA)(ctx.valueB);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    Named interpolation: {{ valueA // i18n(ph="PH_A") }}
    Named interpolation with spaces: {{ valueB // i18n(ph="PH B") }}
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
 * PARTIAL FILE: interpolation_custom_config.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6749967533321674787$$INTERPOLATION_CUSTOM_CONFIG_TS_1 = goog.getMsg("{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_6749967533321674787$$INTERPOLATION_CUSTOM_CONFIG_TS_1;
    }
    else {
        i18n_0 = $localize `${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.valueA);
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>{% valueA %}</div>
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
 * PARTIAL FILE: interpolation_complex_expressions.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 5, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6886266366118454233$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_1 = goog.getMsg(" {$interpolation} {$interpolation_1} {$interpolation_2} ", { "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "interpolation_2": "\uFFFD2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_6886266366118454233$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_1;
    }
    else {
        i18n_0 = $localize ` ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD2\uFFFD"}:INTERPOLATION_2: `;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵpipe(2, "async");
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        let tmp_2_0 = null;
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 3, ctx.valueA))(ctx.valueA == null ? null : ctx.valueA.a == null ? null : ctx.valueA.a.b)((tmp_2_0 = ctx.valueA.getRawValue()) == null ? null : tmp_2_0.getTitle());
        i0.ɵɵi18nApply(1);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    {{ valueA | async }}
    {{ valueA?.a?.b }}
    {{ valueA.getRawValue()?.getTitle() }}
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
 * PARTIAL FILE: bindings_in_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 7, vars: 5, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_572579892698764378$$BINDINGS_IN_CONTENT_TS_1 = goog.getMsg("My i18n block #{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_572579892698764378$$BINDINGS_IN_CONTENT_TS_1;
    }
    else {
        i18n_0 = $localize `My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_609623417156596326$$BINDINGS_IN_CONTENT_TS_3 = goog.getMsg("My i18n block #{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_2 = MSG_EXTERNAL_609623417156596326$$BINDINGS_IN_CONTENT_TS_3;
    }
    else {
        i18n_2 = $localize `My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } let i18n_4; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3998119318957372120$$BINDINGS_IN_CONTENT_TS_5 = goog.getMsg("My i18n block #{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_4 = MSG_EXTERNAL_3998119318957372120$$BINDINGS_IN_CONTENT_TS_5;
    }
    else {
        i18n_4 = $localize `My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [i18n_0, i18n_2, i18n_4]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div");
        i0.ɵɵi18n(3, 1);
        i0.ɵɵpipe(4, "uppercase");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(5, "div");
        i0.ɵɵi18n(6, 2);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.one);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(4, 3, ctx.two));
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.three + ctx.four + ctx.five);
        i0.ɵɵi18nApply(6);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>My i18n block #{{ one }}</div>
  <div i18n>My i18n block #{{ two | uppercase }}</div>
  <div i18n>My i18n block #{{ three + four + five }}</div>
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
 * PARTIAL FILE: bindings_in_content.d.ts
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
 * PARTIAL FILE: nested_elements.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 9, vars: 5, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_882337278752123074$$NESTED_ELEMENTS_TS_1 = goog.getMsg(" My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}", { "interpolation": "\uFFFD0\uFFFD", "startTagSpan": "\uFFFD#2\uFFFD", "closeTagSpan": "\uFFFD/#2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_882337278752123074$$NESTED_ELEMENTS_TS_1;
    }
    else {
        i18n_0 = $localize ` My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#2\uFFFD"}:START_TAG_SPAN:Plain text in nested element${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_SPAN:`;
    } let i18n_2; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_725745709163573690$$NESTED_ELEMENTS_TS_3 = goog.getMsg(" My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}", { "interpolation": "\uFFFD0\uFFFD", "startTagDiv": "[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]", "startTagSpan": "\uFFFD#8\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "closeTagSpan": "\uFFFD/#8\uFFFD", "closeTagDiv": "[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]" });
        i18n_2 = MSG_EXTERNAL_725745709163573690$$NESTED_ELEMENTS_TS_3;
    }
    else {
        i18n_2 = $localize ` My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]"}:START_TAG_DIV:${"[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]"}:START_TAG_DIV:${"\uFFFD#8\uFFFD"}:START_TAG_SPAN: More bindings in more nested element: ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD/#8\uFFFD"}:CLOSE_TAG_SPAN:${"[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"}:CLOSE_TAG_DIV:`;
    } i18n_2 = i0.ɵɵi18nPostprocess(i18n_2); return [i18n_0, i18n_2]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "span");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, "div");
        i0.ɵɵi18nStart(4, 1);
        i0.ɵɵpipe(5, "uppercase");
        i0.ɵɵelementStart(6, "div");
        i0.ɵɵelementStart(7, "div");
        i0.ɵɵelement(8, "span");
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.one);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(6);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(5, 3, ctx.two))(ctx.nestedInBlockTwo);
        i0.ɵɵi18nApply(4);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    My i18n block #{{ one }}
    <span>Plain text in nested element</span>
  </div>
  <div i18n>
    My i18n block #{{ two | uppercase }}
    <div>
      <div>
        <span>
          More bindings in more nested element: {{ nestedInBlockTwo }}
        </span>
      </div>
    </div>
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
 * PARTIAL FILE: nested_elements.d.ts
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
 * PARTIAL FILE: nested_elements_with_i18n_attributes.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 9, vars: 7, consts: function () { let i18n_1; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4782264005467235841$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_2 = goog.getMsg("Span title {$interpolation} and {$interpolation_1}", { "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD" });
        i18n_1 = MSG_EXTERNAL_4782264005467235841$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_2;
    }
    else {
        i18n_1 = $localize `Span title ${"\uFFFD0\uFFFD"}:INTERPOLATION: and ${"\uFFFD1\uFFFD"}:INTERPOLATION_1:`;
    } let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_789713089942130201$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_3 = goog.getMsg(" My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}", { "interpolation": "\uFFFD0\uFFFD", "startTagSpan": "\uFFFD#2\uFFFD", "closeTagSpan": "\uFFFD/#2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_789713089942130201$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_3;
    }
    else {
        i18n_0 = $localize ` My i18n block #1 with value: ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#2\uFFFD"}:START_TAG_SPAN: Plain text in nested element (block #1) ${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_SPAN:`;
    } let i18n_5; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2719594642740200058$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_6 = goog.getMsg("Span title {$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_5 = MSG_EXTERNAL_2719594642740200058$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_6;
    }
    else {
        i18n_5 = $localize `Span title ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } let i18n_4; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_6932146024895341161$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_7 = goog.getMsg(" My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}", { "interpolation": "\uFFFD0\uFFFD", "startTagSpan": "\uFFFD#7\uFFFD", "closeTagSpan": "\uFFFD/#7\uFFFD" });
        i18n_4 = MSG_EXTERNAL_6932146024895341161$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_7;
    }
    else {
        i18n_4 = $localize ` My i18n block #2 with value ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#7\uFFFD"}:START_TAG_SPAN: Plain text in nested element (block #2) ${"\uFFFD/#7\uFFFD"}:CLOSE_TAG_SPAN:`;
    } return [i18n_0, [6, "title"], ["title", i18n_1], i18n_4, ["title", i18n_5]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementStart(2, "span", 1);
        i0.ɵɵi18nAttributes(3, 2);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "div");
        i0.ɵɵi18nStart(5, 3);
        i0.ɵɵpipe(6, "uppercase");
        i0.ɵɵelementStart(7, "span", 1);
        i0.ɵɵi18nAttributes(8, 4);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.valueB)(ctx.valueC);
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(ctx.valueA);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(ctx.valueE);
        i0.ɵɵi18nApply(8);
        i0.ɵɵadvance(1);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(6, 5, ctx.valueD));
        i0.ɵɵi18nApply(5);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
  My i18n block #1 with value: {{ valueA }}
  <span i18n-title title="Span title {{ valueB }} and {{ valueC }}">
    Plain text in nested element (block #1)
  </span>
</div>
<div i18n>
  My i18n block #2 with value {{ valueD | uppercase }}
  <span i18n-title title="Span title {{ valueE }}">
    Plain text in nested element (block #2)
  </span>
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
 * PARTIAL FILE: nested_elements_with_i18n_attributes.d.ts
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
function MyComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵi18nStart(2, 1);
    i0.ɵɵelement(3, "div");
    i0.ɵɵpipe(4, "uppercase");
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵi18nExp(ctx_r0.valueA)(i0.ɵɵpipeBind1(4, 2, ctx_r0.valueB));
    i0.ɵɵi18nApply(2);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_1048067148715869345$$NESTED_TEMPLATES_TS__1 = goog.getMsg(" Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}", { "interpolation": "\uFFFD0\uFFFD", "startTagDiv": "\uFFFD#3\uFFFD", "interpolation_1": "\uFFFD1\uFFFD", "closeTagDiv": "\uFFFD/#3\uFFFD" });
        i18n_0 = MSG_EXTERNAL_1048067148715869345$$NESTED_TEMPLATES_TS__1;
    }
    else {
        i18n_0 = $localize ` Some other content ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#3\uFFFD"}:START_TAG_DIV: More nested levels with bindings ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_DIV:`;
    } return [[4, "ngIf"], i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1, " Some content ");
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 4, "div", 0);
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.visible);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div>
    Some content
    <div *ngIf="visible">
      <div i18n>
        Some other content {{ valueA }}
        <div>
          More nested levels with bindings {{ valueB | uppercase }}
        </div>
      </div>
    </div>
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
 * PARTIAL FILE: self_closing.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_img_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 0);
} }
function MyComponent_img_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "img", 3);
    i0.ɵɵi18nAttributes(1, 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r1.id);
    i0.ɵɵi18nApply(1);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 3, vars: 2, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_2367729185105559721$$SELF_CLOSING_TS__1 = goog.getMsg("App logo #{$interpolation}", { "interpolation": "\uFFFD0\uFFFD" });
        i18n_0 = MSG_EXTERNAL_2367729185105559721$$SELF_CLOSING_TS__1;
    }
    else {
        i18n_0 = $localize `App logo #${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
    } return [["src", "logo.png"], ["src", "logo.png", 4, "ngIf"], ["src", "logo.png", 3, "title", 4, "ngIf"], ["src", "logo.png", 6, "title"], ["title", i18n_0]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelement(0, "img", 0);
        i0.ɵɵtemplate(1, MyComponent_img_1_Template, 1, 0, "img", 1);
        i0.ɵɵtemplate(2, MyComponent_img_2_Template, 2, 1, "img", 2);
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("ngIf", ctx.visible);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <img src="logo.png" i18n />
  <img src="logo.png" i18n *ngIf="visible" />
  <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}" />
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
 * PARTIAL FILE: self_closing.d.ts
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
 * PARTIAL FILE: nested_templates_context.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_div_2_div_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵelement(2, "div");
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r2.valueC)(ctx_r2.valueD);
    i0.ɵɵi18nApply(0);
} }
function MyComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵelementStart(2, "div");
    i0.ɵɵpipe(3, "uppercase");
    i0.ɵɵtemplate(4, MyComponent_div_2_div_4_Template, 3, 2, "div", 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("ngIf", ctx_r0.exists);
    i0.ɵɵi18nExp(ctx_r0.valueA)(i0.ɵɵpipeBind1(3, 3, ctx_r0.valueB));
    i0.ɵɵi18nApply(0);
} }
function MyComponent_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵelement(2, "div");
    i0.ɵɵpipe(3, "uppercase");
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵi18nExp(ctx_r1.valueE + ctx_r1.valueF)(i0.ɵɵpipeBind1(3, 2, ctx_r1.valueG));
    i0.ɵɵi18nApply(0);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 4, vars: 2, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_4021381850553435020$$NESTED_TEMPLATES_CONTEXT_TS__1 = goog.getMsg(" Some content {$startTagDiv_2} Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$startTagDiv_1} Content inside sub-template {$interpolation_2} {$startTagDiv} Bottom level element {$interpolation_3} {$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$closeTagDiv}{$startTagDiv_3} Some other content {$interpolation_4} {$startTagDiv} More nested levels with bindings {$interpolation_5} {$closeTagDiv}{$closeTagDiv}", { "startTagDiv_2": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD", "closeTagDiv": "[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]", "startTagDiv_3": "\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFD", "interpolation": "\uFFFD0:1\uFFFD", "startTagDiv": "[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]", "interpolation_1": "\uFFFD1:1\uFFFD", "startTagDiv_1": "\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFD", "interpolation_2": "\uFFFD0:2\uFFFD", "interpolation_3": "\uFFFD1:2\uFFFD", "interpolation_4": "\uFFFD0:3\uFFFD", "interpolation_5": "\uFFFD1:3\uFFFD" });
        i18n_0 = MSG_EXTERNAL_4021381850553435020$$NESTED_TEMPLATES_CONTEXT_TS__1;
    }
    else {
        i18n_0 = $localize ` Some content ${"\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_DIV_2: Some other content ${"\uFFFD0:1\uFFFD"}:INTERPOLATION: ${"[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]"}:START_TAG_DIV: More nested levels with bindings ${"\uFFFD1:1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD*4:2\uFFFD\uFFFD#1:2\uFFFD"}:START_TAG_DIV_1: Content inside sub-template ${"\uFFFD0:2\uFFFD"}:INTERPOLATION_2: ${"[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]"}:START_TAG_DIV: Bottom level element ${"\uFFFD1:2\uFFFD"}:INTERPOLATION_3: ${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"\uFFFD*3:3\uFFFD\uFFFD#1:3\uFFFD"}:START_TAG_DIV_3: Some other content ${"\uFFFD0:3\uFFFD"}:INTERPOLATION_4: ${"[\uFFFD#2:1\uFFFD|\uFFFD#2:2\uFFFD|\uFFFD#2:3\uFFFD]"}:START_TAG_DIV: More nested levels with bindings ${"\uFFFD1:3\uFFFD"}:INTERPOLATION_5: ${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#2:2\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*4:2\uFFFD|\uFFFD/#2:1\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#2:3\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*3:3\uFFFD]"}:CLOSE_TAG_DIV:`;
    } i18n_0 = i0.ɵɵi18nPostprocess(i18n_0); return [i18n_0, [4, "ngIf"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 5, "div", 1);
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 4, 4, "div", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵadvance(1);
        i0.ɵɵproperty("ngIf", !ctx.visible);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    Some content
    <div *ngIf="visible">
      Some other content {{ valueA }}
      <div>
        More nested levels with bindings {{ valueB | uppercase }}
        <div *ngIf="exists">
          Content inside sub-template {{ valueC }}
          <div>
            Bottom level element {{ valueD }}
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="!visible">
      Some other content {{ valueE + valueF }}
      <div>
        More nested levels with bindings {{ valueG | uppercase }}
      </div>
    </div>
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
 * PARTIAL FILE: nested_templates_context.d.ts
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
 * PARTIAL FILE: directives.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵi18nStart(1, 1);
    i0.ɵɵelement(2, "span");
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.valueA);
    i0.ɵɵi18nApply(1);
} }
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 1, vars: 1, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_119975189388320493$$DIRECTIVES_TS__1 = goog.getMsg("Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}", { "startTagSpan": "\uFFFD#2\uFFFD", "interpolation": "\uFFFD0\uFFFD", "closeTagSpan": "\uFFFD/#2\uFFFD" });
        i18n_0 = MSG_EXTERNAL_119975189388320493$$DIRECTIVES_TS__1;
    }
    else {
        i18n_0 = $localize `Some other content ${"\uFFFD#2\uFFFD"}:START_TAG_SPAN:${"\uFFFD0\uFFFD"}:INTERPOLATION:${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_SPAN:`;
    } return [[4, "ngIf"], i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 1, "div", 0);
    } if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.visible);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n *ngIf="visible">Some other content <span>{{ valueA }}</span></div>
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
 * PARTIAL FILE: directives.d.ts
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
 * PARTIAL FILE: event_listeners.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_3902961887793684628$$EVENT_LISTENERS_TS_1 = goog.getMsg("Hello");
        i18n_0 = MSG_EXTERNAL_3902961887793684628$$EVENT_LISTENERS_TS_1;
    }
    else {
        i18n_0 = $localize `Hello`;
    } return [[3, "click"], i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵlistener("click", function MyComponent_Template_div_click_0_listener() { return ctx.onClick(); });
        i0.ɵɵi18n(1, 1);
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n (click)="onClick()">Hello</div>
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
 * PARTIAL FILE: event_listeners.d.ts
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

