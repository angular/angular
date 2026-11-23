/****************************************************************************************************
 * PARTIAL FILE: dom_only_instruction_set.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
// A standalone component with a plain-DOM template and no directive/pipe dependencies.
// Whether it is compiled to the DOM-only instruction set depends solely on the compilation
// mode:
//   - Full compile: the compiler can see that the template has no directive dependencies, so
//     it takes the DOM-only fast path (`ɵɵdomElementStart`/`ɵɵdomElementEnd`).
//   - Local compile: the compiler cannot inspect the component's dependencies, so it assumes
//     directive dependencies may exist and emits the full instruction set
//     (`ɵɵelementStart`/`ɵɵelementEnd`).
export class DomOnlyCmp {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DomOnlyCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: DomOnlyCmp, isStandalone: true, selector: "ng-component", ngImport: i0, template: '<div><span>hi</span></div>', isInline: true });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: DomOnlyCmp, decorators: [{
            type: Component,
            args: [{
                    standalone: true,
                    template: '<div><span>hi</span></div>',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: dom_only_instruction_set.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class DomOnlyCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<DomOnlyCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DomOnlyCmp, "ng-component", never, {}, {}, never, never, true, never>;
}

