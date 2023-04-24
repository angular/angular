/****************************************************************************************************
 * PARTIAL FILE: component.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
class OtherCmp {
}
OtherCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
OtherCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: OtherCmp, isStandalone: true, isSignal: true, selector: "other-cmp", ngImport: i0, template: '', isInline: true });
export { OtherCmp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: OtherCmp, decorators: [{
            type: Component,
            args: [{
                    signals: true,
                    standalone: true,
                    selector: 'other-cmp',
                    template: '',
                }]
        }] });
class StandaloneCmp {
}
StandaloneCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
StandaloneCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneCmp, isStandalone: true, isSignal: true, selector: "ng-component", ngImport: i0, template: '<other-cmp></other-cmp>', isInline: true, dependencies: [{ kind: "component", type: OtherCmp, selector: "other-cmp" }] });
export { StandaloneCmp };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneCmp, decorators: [{
            type: Component,
            args: [{
                    signals: true,
                    standalone: true,
                    template: '<other-cmp></other-cmp>',
                    imports: [OtherCmp],
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class OtherCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<OtherCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<OtherCmp, "other-cmp", never, {}, {}, never, never, true, never, true>;
}
export declare class StandaloneCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<StandaloneCmp, "ng-component", never, {}, {}, never, never, true, never, true>;
}

/****************************************************************************************************
 * PARTIAL FILE: directive.js
 ****************************************************************************************************/
import { Directive } from '@angular/core';
import * as i0 from "@angular/core";
class StandaloneDir {
}
StandaloneDir.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDir, deps: [], target: i0.ɵɵFactoryTarget.Directive });
StandaloneDir.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: StandaloneDir, isSignal: true, ngImport: i0 });
export { StandaloneDir };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: StandaloneDir, decorators: [{
            type: Directive,
            args: [{
                    signals: true,
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: directive.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class StandaloneDir {
    static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<StandaloneDir, never, never, {}, {}, never, never, false, never, true>;
}

