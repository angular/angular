/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
export class MyApp {
    constructor() {
        this.list = [];
    }
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = i0.ɵɵdefineComponent({ type: MyApp, selectors: [["my-app"]], decls: 1, vars: 9, template: function MyApp_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵtext(0);
    } if (rf & 2) {
        i0.ɵɵtextInterpolateV([" ", ctx.list[0], " ", ctx.list[1], " ", ctx.list[2], " ", ctx.list[3], " ", ctx.list[4], " ", ctx.list[5], " ", ctx.list[6], " ", ctx.list[7], " ", ctx.list[8], " "]);
    } }, encapsulation: 2 });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyApp, [{
        type: Component,
        args: [{
                selector: 'my-app',
                template: ' {{list[0]}} {{list[1]}} {{list[2]}} {{list[3]}} {{list[4]}} {{list[5]}} {{list[6]}} {{list[7]}} {{list[8]}} '
            }]
    }], null, null); })();
export class MyModule {
}
MyModule.ɵmod = i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = i0.ɵɵdefineInjector({ factory: function MyModule_Factory(t) { return new (t || MyModule)(); } });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] }); })();
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyApp] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyApp {
    list: any[];
    static ɵfac: i0.ɵɵFactoryDef<MyApp, never>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MyApp, "my-app", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MyModule, [typeof MyApp], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

