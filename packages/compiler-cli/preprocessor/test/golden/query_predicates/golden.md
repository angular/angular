# /out/test.ts
```ts
import { Component, viewChild, contentChildren } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['myDiv'];

const nonAnalyzableRefersToString = 'mySelector';

export class TestComp {
  // String literal predicate: should compile to a string array
  stringQuery = viewChild(
    'myDiv',
    ...((ngDevMode ? [{ debugName: 'stringQuery' }] : /* istanbul ignore next */ []) as []),
  );

  // Constant identifier reference: should compile to the raw identifier expression (NOT evaluated to a string array)
  constantQuery = contentChildren(nonAnalyzableRefersToString, {
    ...(ngDevMode ? { debugName: 'constantQuery' } : /* istanbul ignore next */ {}),
    descendants: true,
  });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'test-comp',
    never,
    {},
    {},
    ['constantQuery'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['test-comp']],
    contentQueries: function TestComp_ContentQueries(rf: number, ctx: any, dirIndex: number): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.constantQuery, nonAnalyzableRefersToString, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
      }
    },
    viewQuery: function TestComp_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.stringQuery, _c0, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
      }
    },
    decls: 1,
    vars: 0,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
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
                selector: 'test-comp',
                template: '<div></div>',
                standalone: true,
              },
            ],
          },
        ],
        null,
        {
          constantQuery: [
            {
              type: i0.ContentChildren,
              args: [
                i0.forwardRef(() => nonAnalyzableRefersToString),
                { isSignal: true, descendants: true },
              ],
            },
          ],
          stringQuery: [{ type: i0.ViewChild, args: ['myDiv', { isSignal: true }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, { className: 'TestComp', filePath: 'test.ts', lineNumber: 10 });
})();

```