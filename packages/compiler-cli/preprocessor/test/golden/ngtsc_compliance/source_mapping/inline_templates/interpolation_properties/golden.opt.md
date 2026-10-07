# /out/interpolation_properties.ngtypecheck.ts
```ts
/**
 * TCB for /interpolation_properties.ts
 * @generated
 */

import * as i0 from './interpolation_properties';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    '' + this.name /*107,111*/ /*107,111*/;
  }
}

```

# /out/interpolation_properties.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
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
    vars: 2,
    consts: [[3, 'id']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('id', i0.ɵɵinterpolate(ctx.name));
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
                template: '<div id="{{name}}"></div>',
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
      filePath: 'interpolation_properties.ts',
      lineNumber: 8,
    });
})();

```