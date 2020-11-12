/****************************************************************************************************
 * PARTIAL FILE: preserve_inner_content.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 5, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_5871145577455911624$$PRESERVE_INNER_CONTENT_TS_1 = goog.getMsg("\n    Some text\n    {$startTagSpan}Text inside span{$closeTagSpan}\n  ", { "startTagSpan": "\uFFFD#3\uFFFD", "closeTagSpan": "\uFFFD/#3\uFFFD" });
        i18n_0 = MSG_EXTERNAL_5871145577455911624$$PRESERVE_INNER_CONTENT_TS_1;
    }
    else {
        i18n_0 = $localize `
    Some text
    ${"\uFFFD#3\uFFFD"}:START_TAG_SPAN:Text inside span${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_SPAN:
  `;
    } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtext(0, "\n  ");
        i0.ɵɵelementStart(1, "div");
        i0.ɵɵi18nStart(2, 0);
        i0.ɵɵelement(3, "span");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵtext(4, "\n");
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <div i18n>
    Some text
    <span>Text inside span</span>
  </div>
`,
                preserveWhitespaces: true,
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
 * PARTIAL FILE: preserve_inner_content.d.ts
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

