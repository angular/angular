/****************************************************************************************************
 * PARTIAL FILE: foreign_object.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 5, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_8448806415640562150$$FOREIGN_OBJECT_TS_1 = goog.getMsg("{$startTagXhtmlDiv} Count: {$startTagXhtmlSpan}5{$closeTagXhtmlSpan}{$closeTagXhtmlDiv}", { "startTagXhtmlDiv": "\uFFFD#3\uFFFD", "startTagXhtmlSpan": "\uFFFD#4\uFFFD", "closeTagXhtmlSpan": "\uFFFD/#4\uFFFD", "closeTagXhtmlDiv": "\uFFFD/#3\uFFFD" });
        i18n_0 = MSG_EXTERNAL_8448806415640562150$$FOREIGN_OBJECT_TS_1;
    }
    else {
        i18n_0 = $localize `${"\uFFFD#3\uFFFD"}:START_TAG__XHTML_DIV: Count: ${"\uFFFD#4\uFFFD"}:START_TAG__XHTML_SPAN:5${"\uFFFD/#4\uFFFD"}:CLOSE_TAG__XHTML_SPAN:${"\uFFFD/#3\uFFFD"}:CLOSE_TAG__XHTML_DIV:`;
    } return [["xmlns", "http://www.w3.org/2000/svg"], i18n_0, ["xmlns", "http://www.w3.org/1999/xhtml"]]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵelementStart(0, "svg", 0);
        i0.ɵɵelementStart(1, "foreignObject");
        i0.ɵɵi18nStart(2, 1);
        i0.ɵɵnamespaceHTML();
        i0.ɵɵelementStart(3, "div", 2);
        i0.ɵɵelement(4, "span");
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <svg xmlns="http://www.w3.org/2000/svg">
    <foreignObject i18n>
      <xhtml:div xmlns="http://www.w3.org/1999/xhtml">
        Count: <span>5</span>
      </xhtml:div>
    </foreignObject>
  </svg>
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
 * PARTIAL FILE: foreign_object.d.ts
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
 * PARTIAL FILE: namespaced_div.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 5, vars: 0, consts: function () { let i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        const MSG_EXTERNAL_638066648693524227$$NAMESPACED_DIV_TS_1 = goog.getMsg(" Count: {$startTagXhtmlSpan}5{$closeTagXhtmlSpan}", { "startTagXhtmlSpan": "\uFFFD#4\uFFFD", "closeTagXhtmlSpan": "\uFFFD/#4\uFFFD" });
        i18n_0 = MSG_EXTERNAL_638066648693524227$$NAMESPACED_DIV_TS_1;
    }
    else {
        i18n_0 = $localize ` Count: ${"\uFFFD#4\uFFFD"}:START_TAG__XHTML_SPAN:5${"\uFFFD/#4\uFFFD"}:CLOSE_TAG__XHTML_SPAN:`;
    } return [["xmlns", "http://www.w3.org/2000/svg"], ["xmlns", "http://www.w3.org/1999/xhtml"], i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵnamespaceSVG();
        i0.ɵɵelementStart(0, "svg", 0);
        i0.ɵɵelementStart(1, "foreignObject");
        i0.ɵɵnamespaceHTML();
        i0.ɵɵelementStart(2, "div", 1);
        i0.ɵɵi18nStart(3, 2);
        i0.ɵɵelement(4, "span");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: `
  <svg xmlns="http://www.w3.org/2000/svg">
    <foreignObject>
      <xhtml:div xmlns="http://www.w3.org/1999/xhtml" i18n>
        Count: <span>5</span>
      </xhtml:div>
    </foreignObject>
  </svg>
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
 * PARTIAL FILE: namespaced_div.d.ts
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

