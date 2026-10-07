# /out/regular_expression_with_sticky_flag.ngtypecheck.ts
```ts
/**
 * TCB for /regular_expression_with_sticky_flag.ts
 * @generated
 */

import * as i0 from './regular_expression_with_sticky_flag';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' + /^hello/y.test(/*80,84*/ this.value /*85,90*/ /*85,90*/) /*70,91*/;
  }
}

```

# /out/regular_expression_with_sticky_flag.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComp {
  value = '123';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    decls: 1,
    vars: 1,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate(/^hello/y.test(ctx.value));
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                template: `{{/^hello/y.test(value)}}`,
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'regular_expression_with_sticky_flag.ts',
      lineNumber: 6,
    });
})();

```