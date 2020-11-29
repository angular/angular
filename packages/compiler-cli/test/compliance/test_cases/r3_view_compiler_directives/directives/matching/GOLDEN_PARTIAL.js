/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
import { Component, Directive, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class I18nDirective {
}
I18nDirective.ɵfac = function I18nDirective_Factory(t) { return new (t || I18nDirective)(); };
I18nDirective.ɵdir = i0.ɵɵngDeclareDirective({ version: 1, type: I18nDirective, selector: "[i18n]", ngImport: i0 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(I18nDirective, [{
        type: Directive,
        args: [{ selector: '[i18n]' }]
    }], null, null); })();
export class MyComponent {
}
MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: 1, type: MyComponent, selector: "my-component", ngImport: i0, template: { source: '<div i18n></div>', isInline: true } });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ selector: 'my-component', template: '<div i18n></div>' }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [I18nDirective, MyComponent] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [I18nDirective, MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class I18nDirective {
    static ɵfac: i0.ɵɵFactoryDef<I18nDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<I18nDirective, "[i18n]", never, {}, {}, never>;
}
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof I18nDirective, typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

