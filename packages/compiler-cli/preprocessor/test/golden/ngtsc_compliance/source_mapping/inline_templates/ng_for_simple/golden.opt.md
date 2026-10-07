# /out/ng_for_simple.ngtypecheck.ts
```ts
/**
 * TCB for /ng_for_simple.ts
 * @generated
 */

import * as i0 from './ng_for_simple';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*113,117*/ = _t1.$implicit; /*109,118*/
      var _t3 /*137,138*/ = _t1.index /*128,133*/; /*128,140*/
      '' + _t2 /*163,167*/;
    }
  }
}

```

# /out/ng_for_simple.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmp_div_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r1);
  }
}

export class TestCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 1,
    vars: 2,
    consts: [[4, 'ngFor', 'ngForOf', 'ngForTrackBy']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmp_div_0_Template, 2, 1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngForOf', ctx.items)('ngForTrackBy', ctx.trackByFn);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template:
                  '<div *ngFor="let item of items; index as i; trackBy: trackByFn">{{ item }}</div>',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'ng_for_simple.ts',
      lineNumber: 8,
    });
})();

```