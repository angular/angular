# /out/input_binding_class.ngtypecheck.ts
```ts
/**
 * TCB for /input_binding_class.ts
 * @generated
 */

import * as i0 from './input_binding_class';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    this.isInitial /*118,127*/ /*118,127*/;
  }
}

```

# /out/input_binding_class.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  isInitial: boolean = true;
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
    vars: 2,
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Message');
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵclassProp('initial', ctx.isInitial);
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
                template: '<div [class.initial]="isInitial">Message</div>',
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
      filePath: 'input_binding_class.ts',
      lineNumber: 8,
    });
})();

```