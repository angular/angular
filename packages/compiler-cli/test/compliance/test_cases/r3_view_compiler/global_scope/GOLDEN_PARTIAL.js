/****************************************************************************************************
 * PARTIAL FILE: basic_global.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Comp, isStandalone: true, selector: "ng-component", ngImport: i0, template: '{{globalThis.Math.random()}}', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, decorators: [{
            type: Component,
            args: [{
                    template: '{{globalThis.Math.random()}}',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: basic_global.d.ts
 ****************************************************************************************************/
export {};

/****************************************************************************************************
 * PARTIAL FILE: this_globalThis_access.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class Comp {
    constructor() {
        this.globalThis = globalThis;
    }
}
Comp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, deps: [], target: i0.ɵɵFactoryTarget.Component });
Comp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: Comp, isStandalone: true, selector: "ng-component", ngImport: i0, template: '{{this.globalThis.Math.random()}}', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: Comp, decorators: [{
            type: Component,
            args: [{
                    template: '{{this.globalThis.Math.random()}}',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: this_globalThis_access.d.ts
 ****************************************************************************************************/
export {};

