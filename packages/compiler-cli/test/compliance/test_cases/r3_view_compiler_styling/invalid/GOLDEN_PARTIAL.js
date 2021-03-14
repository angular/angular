/****************************************************************************************************
 * PARTIAL FILE: individual_class_binding.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class MyComponent {
    constructor() {
        this.isEnabled = true;
    }
}
MyComponent.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: MyComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
MyComponent.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: MyComponent, selector: "ng-component", ngImport: i0, template: '<div class.something="{{isEnabled}}"></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MyComponent, [{
        type: Component,
        args: [{ template: '<div class.something="{{isEnabled}}"></div>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: individual_class_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class MyComponent {
    isEnabled: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MyComponent, "ng-component", never, {}, {}, never, never>;
}

