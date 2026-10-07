# /out/query_in_component.ngtypecheck.ts
```ts
/**
 * TCB for /query_in_component.ts
 * @generated
 */

import * as i0 from './query_in_component';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
  }
}

```

# /out/query_in_component.ts
```ts
import { Component, contentChild, contentChildren, viewChild, viewChildren } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['locatorC'];
const _c1 = ['locatorD'];
const _c2 = ['locatorA'];
const _c3 = ['locatorB'];

export class TestComp {
  query1 = viewChild(
    'locatorA',
    ...((ngDevMode ? [{ debugName: 'query1' }] : /* istanbul ignore next */ []) as []),
  );
  query2 = viewChildren(
    'locatorB',
    ...((ngDevMode ? [{ debugName: 'query2' }] : /* istanbul ignore next */ []) as []),
  );
  query3 = contentChild(
    'locatorC',
    ...((ngDevMode ? [{ debugName: 'query3' }] : /* istanbul ignore next */ []) as []),
  );
  query4 = contentChildren(
    'locatorD',
    ...((ngDevMode ? [{ debugName: 'query4' }] : /* istanbul ignore next */ []) as []),
  );
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
    ['query3', 'query4'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    contentQueries: function TestComp_ContentQueries(rf: number, ctx: any, dirIndex: number): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5)(dirIndex, ctx.query4, _c1, 4);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(2);
      }
    },
    viewQuery: function TestComp_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.query1, _c2, 5)(ctx.query2, _c3, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(2);
      }
    },
    decls: 1,
    vars: 0,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Works');
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
                template: 'Works',
              },
            ],
          },
        ],
        null,
        {
          query3: [
            { type: i0.ContentChild, args: ['locatorC', { isSignal: true, descendants: true }] },
          ],
          query4: [{ type: i0.ContentChildren, args: ['locatorD', { isSignal: true }] }],
          query1: [{ type: i0.ViewChild, args: ['locatorA', { isSignal: true }] }],
          query2: [{ type: i0.ViewChildren, args: ['locatorB', { isSignal: true }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'query_in_component.ts',
      lineNumber: 6,
    });
})();

```