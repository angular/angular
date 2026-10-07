# /out/ng_if_templated.ngtypecheck.ts
```ts
/**
 * TCB for /ng_if_templated.ts
 * @generated
 */

import * as i0 from './ng_if_templated';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    {
      '' + this.name /*152,156*/ /*152,156*/;
    }
  }
}

```

# /out/ng_if_templated.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TestCmp_ng_template_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'div');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(2, 'hr');
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.name);
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
    consts: [[3, 'ngIf']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtemplate(0, TestCmp_ng_template_0_Template, 3, 1, 'ng-template', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('ngIf', ctx.showMessage());
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
                template: `
        <ng-template [ngIf]="showMessage()">
          <div>{{ name }}</div>
          <hr>
        </ng-template>`,
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
      filePath: 'ng_if_templated.ts',
      lineNumber: 12,
    });
})();

```