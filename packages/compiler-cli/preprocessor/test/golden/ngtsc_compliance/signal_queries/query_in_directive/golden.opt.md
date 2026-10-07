# /out/query_in_directive.ts
```ts
import {
  contentChild,
  contentChildren,
  Directive,
  forwardRef,
  viewChild,
  viewChildren,
} from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['locatorC'];
const _c1 = ['locatorD'];
const _c2 = ['locatorF', 'locatorG'];
const _c3 = ['locatorA'];
const _c4 = ['locatorB'];
const _c5 = ['locatorE'];

export class SomeToken {}

const nonAnalyzableRefersToString = 'a, b, c';

export class TestDir {
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

  query5 = viewChild(
    forwardRef(() => SomeToken),
    ...((ngDevMode ? [{ debugName: 'query5' }] : /* istanbul ignore next */ []) as []),
  );
  query6 = viewChildren(
    SomeToken,
    ...((ngDevMode ? [{ debugName: 'query6' }] : /* istanbul ignore next */ []) as []),
  );
  query7 = viewChild('locatorE', {
    ...(ngDevMode ? { debugName: 'query7' } : /* istanbul ignore next */ {}),
    read: SomeToken,
  });
  query8 = contentChildren('locatorF, locatorG', {
    ...(ngDevMode ? { debugName: 'query8' } : /* istanbul ignore next */ {}),
    descendants: true,
  });
  query9 = contentChildren(nonAnalyzableRefersToString, {
    ...(ngDevMode ? { debugName: 'query9' } : /* istanbul ignore next */ {}),
    descendants: true,
  });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never> = function TestDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestDir,
    never,
    never,
    {},
    {},
    ['query3', 'query4', 'query8', 'query9'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    contentQueries: function TestDir_ContentQueries(rf: number, ctx: any, dirIndex: number): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5)(dirIndex, ctx.query4, _c1, 4)(
          dirIndex,
          ctx.query8,
          _c2,
          5,
        )(dirIndex, ctx.query9, nonAnalyzableRefersToString, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(4);
      }
    },
    viewQuery: function TestDir_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.query1, _c3, 5)(ctx.query2, _c4, 5)(ctx.query5, SomeToken, 5)(
          ctx.query6,
          SomeToken,
          5,
        )(ctx.query7, _c5, 5, SomeToken);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(5);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        query3: [
          { type: i0.ContentChild, args: ['locatorC', { isSignal: true, descendants: true }] },
        ],
        query4: [{ type: i0.ContentChildren, args: ['locatorD', { isSignal: true }] }],
        query8: [
          {
            type: i0.ContentChildren,
            args: ['locatorF, locatorG', { isSignal: true, descendants: true }],
          },
        ],
        query9: [
          {
            type: i0.ContentChildren,
            args: [
              i0.forwardRef(() => nonAnalyzableRefersToString),
              { isSignal: true, descendants: true },
            ],
          },
        ],
        query1: [{ type: i0.ViewChild, args: ['locatorA', { isSignal: true }] }],
        query2: [{ type: i0.ViewChildren, args: ['locatorB', { isSignal: true }] }],
        query5: [
          { type: i0.ViewChild, args: [i0.forwardRef(() => SomeToken), { isSignal: true }] },
        ],
        query6: [
          { type: i0.ViewChildren, args: [i0.forwardRef(() => SomeToken), { isSignal: true }] },
        ],
        query7: [{ type: i0.ViewChild, args: ['locatorE', { isSignal: true, read: SomeToken }] }],
      });
  }
}

```