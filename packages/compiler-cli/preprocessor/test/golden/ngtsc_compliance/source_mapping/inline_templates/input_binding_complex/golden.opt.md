# /out/input_binding_complex.ngtypecheck.ts
```ts
/**
 * TCB for /input_binding_complex.ts
 * @generated
 */

import * as i0 from './input_binding_complex';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    this.greeting /*110,118*/ /*110,118*/ + this.name /*121,125*/ /*121,125*/ /*110,125*/;
  }
}

```

# /out/input_binding_complex.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  greeting: string = '';
  name: string = '';
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
    consts: [[3, 'title']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.greeting + ctx.name);
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
                template: '<div [title]="greeting + name"></div>',
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
      filePath: 'input_binding_complex.ts',
      lineNumber: 8,
    });
})();

```