/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
import { Component, NgModule } from '@angular/core';
import * as i0 from "@angular/core";
var MyComponent = /** @class */ (function () {
    function MyComponent() {
    }
    MyComponent.ɵfac = function MyComponent_Factory(t) { return new (t || MyComponent)(); };
    MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "my-component", ngImport: i0, template: '<div i18n="meaning:A|descA@@idA">Content A</div>', isInline: true });
    return MyComponent;
}());
export { MyComponent };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{
                selector: 'my-component',
                template: '<div i18n="meaning:A|descA@@idA">Content A</div>',
            }]
    }], null, null); })();
var MyModule = /** @class */ (function () {
    function MyModule() {
    }
    MyModule.ɵfac = function MyModule_Factory(t) { return new (t || MyModule)(); };
    MyModule.ɵmod = i0.ɵɵngDeclareNgModule({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule, declarations: [MyComponent] });
    MyModule.ɵinj = i0.ɵɵngDeclareInjector({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyModule });
    return MyModule;
}());
export { MyModule };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyModule, [{
        type: NgModule,
        args: [{ declarations: [MyComponent] }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    static ɵfac: i0.ɵɵFactoryDef<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "my-component", never, {}, {}, never, never>;
}
export declare class MyModule {
    static ɵfac: i0.ɵɵFactoryDef<MyModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never>;
    static ɵinj: i0.ɵɵInjectorDef<MyModule>;
}

