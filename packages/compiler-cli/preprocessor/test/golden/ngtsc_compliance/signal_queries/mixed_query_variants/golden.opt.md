# /out/mixed_query_variants.ts
```ts
import { ContentChild, contentChild, Directive, ViewChild, viewChild } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = ['locator2'];
const _c1 = ['locator1'];

export class TestDir {
  decoratorViewChild: unknown;
  signalViewChild = viewChild(
    'locator1',
    ...((ngDevMode ? [{ debugName: 'signalViewChild' }] : /* istanbul ignore next */ []) as []),
  );

  decoratorContentChild: unknown;
  signalContentChild = contentChild(
    'locator2',
    ...((ngDevMode ? [{ debugName: 'signalContentChild' }] : /* istanbul ignore next */ []) as []),
  );
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
    ['signalContentChild', 'decoratorContentChild'],
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    contentQueries: function TestDir_ContentQueries(rf: number, ctx: any, dirIndex: number): any {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.signalContentChild, _c0, 5);
        i0.ɵɵcontentQuery(dirIndex, _c0, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.decoratorContentChild = _t.first);
      }
    },
    viewQuery: function TestDir_Query(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.signalViewChild, _c1, 5);
        i0.ɵɵviewQuery(_c1, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
        let _t: any;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.decoratorViewChild = _t.first);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        decoratorViewChild: [{ type: ViewChild, args: ['locator1'] }],
        decoratorContentChild: [{ type: ContentChild, args: ['locator2'] }],
        signalContentChild: [
          { type: i0.ContentChild, args: ['locator2', { isSignal: true, descendants: true }] },
        ],
        signalViewChild: [{ type: i0.ViewChild, args: ['locator1', { isSignal: true }] }],
      });
  }
}

```