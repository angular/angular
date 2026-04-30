import { NgModule, NO_ERRORS_SCHEMA, forwardRef, Component, Directive } from '@angular/core';
import * as i0 from "@angular/core";

…

export class MyModule {
    static ɵfac = function MyModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MyModule)(); };
    static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule, bootstrap: [MyBootstrap], id: 'my-module-id' });
    static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [MyImport] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{
                declarations: [MyDecl, MyExport],
                imports: [MyImport],
                exports: [MyExport],
                bootstrap: [forwardRef(() => MyBootstrap)],
                schemas: [NO_ERRORS_SCHEMA],
                id: 'my-module-id'
            }]
    }], null, null); })();
…
i0.ɵɵregisterNgModuleType(MyModule, 'my-module-id');
