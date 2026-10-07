# /out/output_binding_simple.ngtypecheck.ts
```ts
/**
 * TCB for /output_binding_simple.ts
 * @generated
 */

import * as i0 from './output_binding_simple';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 /*96,128*/ = document.createElement('button'); /*96,128*/ /*96,128*/
    _t1.addEventListener(/*105,110*/ 'click', ($event /*T:EP*/): any => {
      this
        .doSomething /*113,124*/
        () /*113,126*/;
    }) /*104,127*/;
  }
}

```

# /out/output_binding_simple.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  doSomething() {}
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
          return ctx.doSomething();
        });
        i0.ɵɵtext(1, 'Do it');
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
                template: '<button (click)="doSomething()">Do it</button>',
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
      filePath: 'output_binding_simple.ts',
      lineNumber: 8,
    });
})();

```