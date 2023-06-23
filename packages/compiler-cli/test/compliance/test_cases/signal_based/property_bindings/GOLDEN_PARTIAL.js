/****************************************************************************************************
 * PARTIAL FILE: simple_dom_binding.js
 ****************************************************************************************************/
import { Component, signal } from '@angular/core';
import * as i0 from "@angular/core";
export class LiteralValueBinding {
}
LiteralValueBinding.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LiteralValueBinding, deps: [], target: i0.ɵɵFactoryTarget.Component });
LiteralValueBinding.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: LiteralValueBinding, isSignal: true, selector: "app", ngImport: i0, template: `<button [disabled]="true"></button>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: LiteralValueBinding, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    template: `<button [disabled]="true"></button>`,
                }]
        }] });
export class FromContextBindingStatic {
    constructor() {
        this.isDisabled = true;
    }
}
FromContextBindingStatic.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FromContextBindingStatic, deps: [], target: i0.ɵɵFactoryTarget.Component });
FromContextBindingStatic.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: FromContextBindingStatic, isSignal: true, selector: "app", ngImport: i0, template: `<button [disabled]="isDisabled"></button>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FromContextBindingStatic, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    template: `<button [disabled]="isDisabled"></button>`,
                }]
        }] });
export class FromContextBindingSignal {
    constructor() {
        this.isDisabled = signal(true);
    }
}
FromContextBindingSignal.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FromContextBindingSignal, deps: [], target: i0.ɵɵFactoryTarget.Component });
FromContextBindingSignal.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: FromContextBindingSignal, isSignal: true, selector: "app", ngImport: i0, template: `<button [disabled]="isDisabled()"></button>`, isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: FromContextBindingSignal, decorators: [{
            type: Component,
            args: [{
                    selector: 'app',
                    signals: true,
                    template: `<button [disabled]="isDisabled()"></button>`,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: simple_dom_binding.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class LiteralValueBinding {
    static ɵfac: i0.ɵɵFactoryDeclaration<LiteralValueBinding, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<LiteralValueBinding, "app", never, {}, {}, never, never, false, never, true>;
}
export declare class FromContextBindingStatic {
    isDisabled: boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<FromContextBindingStatic, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FromContextBindingStatic, "app", never, {}, {}, never, never, false, never, true>;
}
export declare class FromContextBindingSignal {
    isDisabled: import("@angular/core").WritableSignal<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FromContextBindingSignal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FromContextBindingSignal, "app", never, {}, {}, never, never, false, never, true>;
}

