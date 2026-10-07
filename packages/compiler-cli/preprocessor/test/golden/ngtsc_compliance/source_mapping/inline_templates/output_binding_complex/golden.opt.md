# /out/output_binding_complex.ngtypecheck.ts
```ts
/**
 * TCB for /output_binding_complex.ts
 * @generated
 */

import * as i0 from './output_binding_complex';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 /*96,148*/ = document.createElement('button'); /*96,148*/ /*96,148*/
    _t1.addEventListener(/*105,110*/ 'click', ($event /*T:EP*/): any => {
      this.items /*113,118*/ /*113,118*/
        .push(
          /*119,123*/ 'item' /*124,130*/ +
            this.items /*133,138*/ /*133,138*/.length /*139,145*/ /*133,145*/ /*124,145*/,
        ) /*113,146*/;
    }) /*104,147*/;
  }
}

```

# /out/output_binding_complex.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  items: string[] = [];
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
    decls: 2,
    vars: 0,
    consts: [[3, 'click']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'button', 0);
        i0.ɵɵlistener('click', function TestCmp_Template_button_click_0_listener(): any {
          return ctx.items.push('item' + ctx.items.length);
        });
        i0.ɵɵtext(1, 'Add Item');
        i0.ɵɵelementEnd();
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
                template: `<button (click)="items.push('item' + items.length)">Add Item</button>`,
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
      filePath: 'output_binding_complex.ts',
      lineNumber: 8,
    });
})();

```