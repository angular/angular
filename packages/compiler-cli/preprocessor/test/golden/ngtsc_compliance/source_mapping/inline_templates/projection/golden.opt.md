# /out/projection.ngtypecheck.ts
```ts
/**
 * TCB for /projection.ts
 * @generated
 */

import * as i0 from './projection';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
  }
}

```

# /out/projection.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = [[['title']], '*'];
const _c1 = ['title', '*'];

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
    ['title', '*'],
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    ngContentSelectors: _c1,
    decls: 4,
    vars: 0,
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵelementStart(0, 'h3');
        i0.ɵɵprojection(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'div');
        i0.ɵɵprojection(3, 1);
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
                template: `
      <h3><ng-content select="title"></ng-content></h3>
      <div><ng-content></ng-content></div>`,
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
      filePath: 'projection.ts',
      lineNumber: 10,
    });
})();

```