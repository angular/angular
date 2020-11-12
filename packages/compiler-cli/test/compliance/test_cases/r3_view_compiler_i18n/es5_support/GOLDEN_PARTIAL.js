/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
var MyComponent = /** @class */ (function () {
    function MyComponent() {
    }
    MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
    MyComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MyComponent, selectors: [["my-component"]], decls: 2, vars: 0, consts: function () { var i18n_0; if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
            /**
             * @desc descA
             * @meaning meaning:A
             */
            var MSG_EXTERNAL_idA$$TEST_TS_1 = goog.getMsg("Content A");
            i18n_0 = MSG_EXTERNAL_idA$$TEST_TS_1;
        }
        else {
            i18n_0 = $localize(templateObject_1 || (templateObject_1 = __makeTemplateObject([":meaning:A|descA@@idA:Content A"], [":meaning\\:A|descA@@idA:Content A"])));
        } return [i18n_0]; }, template: function MyComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div");
            i0.ɵɵi18n(1, 0);
            i0.ɵɵelementEnd();
        } }, encapsulation: 2 });
    return MyComponent;
}());
export { MyComponent };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '<div i18n="meaning:A|descA@@idA">Content A</div>',
            }]
    }], null, null); })();
var MyModule = /** @class */ (function () {
    function MyModule() {
    }
    MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
    MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
    return MyModule;
}());
export { MyModule };
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();
var templateObject_1;

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
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

