# /out/output_binding_longhand.ngtypecheck.ts
```ts
/**
 * TCB for /output_binding_longhand.ts
 * @generated
 */

import * as i0 from './output_binding_longhand';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    var _t1 /*96,129*/ = document.createElement('button'); /*96,129*/ /*96,129*/
    _t1.addEventListener(/*107,112*/ 'click', ($event /*T:EP*/): any => {
      this
        .doSomething /*114,125*/
        () /*114,127*/;
    }) /*104,128*/;
  }
}

```

# /out/output_binding_longhand.ts
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
                template: '<button on-click="doSomething()">Do it</button>',
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
      filePath: 'output_binding_longhand.ts',
      lineNumber: 8,
    });
})();

```