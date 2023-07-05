/****************************************************************************************************
 * PARTIAL FILE: output_definition.js
 ****************************************************************************************************/
import { Component, output } from '@angular/core';
import * as i0 from "@angular/core";
export class SensorComp {
    constructor() {
        this.pressed = output();
        this._internalName = output({ alias: 'touched' });
    }
}
SensorComp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SensorComp, deps: [], target: i0.ɵɵFactoryTarget.Component });
SensorComp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: SensorComp, isStandalone: true, isSignal: true, selector: "ng-component", outputs: { pressed: "pressed", _internalName: "touched" }, ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: SensorComp, decorators: [{
            type: Component,
            args: [{
                    signals: true,
                    standalone: true,
                    template: '',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: output_definition.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class SensorComp {
    pressed: import("@angular/core").EventEmitter<void>;
    _internalName: import("@angular/core").EventEmitter<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<SensorComp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SensorComp, "ng-component", never, {}, { "pressed": "pressed"; "_internalName": "touched"; }, never, never, true, never, true>;
}

