/****************************************************************************************************
 * PARTIAL FILE: basic_any_cast.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Comp, selector: "ng-component", ngImport: i0, template: '<div [tabIndex]="$any(10)"></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
        type: Component,
        args: [{ template: '<div [tabIndex]="$any(10)"></div>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: basic_any_cast.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: this_any_access.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
    $any(value) {
        return value;
    }
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ version: "0.0.0-PLACEHOLDER", type: Comp, selector: "ng-component", ngImport: i0, template: '<div [tabIndex]="this.$any(null)"></div>', isInline: true });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(Comp, [{
        type: Component,
        args: [{ template: '<div [tabIndex]="this.$any(null)"></div>' }]
    }], null, null); })();

/****************************************************************************************************
 * PARTIAL FILE: this_any_access.d.ts
 ****************************************************************************************************/
export {};

