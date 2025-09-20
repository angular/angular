/****************************************************************************************************
 * PARTIAL FILE: counter.component.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class CounterComponent {
}
CounterComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CounterComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
CounterComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "0.0.0-PLACEHOLDER", type: CounterComponent, isStandalone: true, selector: "my-counter-cmp", ngImport: i0, template: 'Counter!', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: CounterComponent, decorators: [{
            type: Component,
            args: [{
                    standalone: true,
                    selector: 'my-counter-cmp',
                    template: 'Counter!',
                }]
        }] });

/****************************************************************************************************
 * PARTIAL FILE: counter.component.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class CounterComponent {
    static ɵfac: i0.ɵɵFactoryDeclaration<CounterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CounterComponent, "my-counter-cmp", never, {}, {}, never, never, true, never>;
}

/****************************************************************************************************
 * PARTIAL FILE: index.js
 ****************************************************************************************************/
export { CounterComponent as MyCounterCmp } from './counter.component';

/****************************************************************************************************
 * PARTIAL FILE: index.d.ts
 ****************************************************************************************************/
export { CounterComponent as MyCounterCmp } from './counter.component';

/****************************************************************************************************
 * PARTIAL FILE: test.js
 ****************************************************************************************************/
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
export class TestCmp {
}
TestCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
TestCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "0.0.0-PLACEHOLDER", type: TestCmp, isStandalone: true, selector: "test-cmp", ngImport: i0, template: `
    @defer {
      <my-counter-cmp />
    }
  `, isInline: true, deferBlockDependencies: [() => [import("./index").then(m => m.MyCounterCmp)]] });
i0.ɵɵngDeclareClassMetadataAsync({ minVersion: "18.0.0", version: "0.0.0-PLACEHOLDER", ngImport: i0, type: TestCmp, resolveDeferredDeps: () => [import("./index").then(m => m.MyCounterCmp)], resolveMetadata: MyCounterCmp => ({ decorators: [{
                type: Component,
                args: [{
                        selector: 'test-cmp',
                        standalone: true,
                        imports: [MyCounterCmp],
                        template: `
    @defer {
      <my-counter-cmp />
    }
  `,
                    }]
            }], ctorParameters: null, propDecorators: null }) });

/****************************************************************************************************
 * PARTIAL FILE: test.d.ts
 ****************************************************************************************************/
import * as i0 from "@angular/core";
export declare class TestCmp {
    static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;
}

