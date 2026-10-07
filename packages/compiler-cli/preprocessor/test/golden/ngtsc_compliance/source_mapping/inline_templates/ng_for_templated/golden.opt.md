# /out/ng_for_templated.ngtypecheck.ts
```ts
/**
 * TCB for /ng_for_templated.ts
 * @generated
 */

import * as i0 from './ng_for_templated';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*137,141*/ = _t1.$implicit; /*133,141*/
      '' + _t2 /*145,149*/;
    }
  }
}

```

# /out/ng_for_templated.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmp_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const item_r1: any = ctx.$implicit;
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
    vars: 1,
    consts: [['ngFor', '', 3, 'ngForOf']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmp_ng_template_0_Template, 1, 1, 'ng-template', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngForOf', ctx.items);
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
                template: `<ng-template ngFor [ngForOf]="items" let-item>{{ item }}</ng-template>`,
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
      filePath: 'ng_for_templated.ts',
      lineNumber: 8,
    });
})();

```