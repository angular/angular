import { ContentChild, contentChild, Directive, ViewChild, viewChild } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["locator2"];
const _c1 = ["locator1"];
export class TestDir {
  decoratorViewChild;
  signalViewChild = viewChild(
    "locator1" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "signalViewChild" }] : /* istanbul ignore next */ [])
  );
  decoratorContentChild;
  signalContentChild = contentChild(
    "locator2" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "signalContentChild" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    contentQueries: function TestDir_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.signalContentChild, _c0, 5);
        i0.ɵɵcontentQuery(dirIndex, _c0, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.decoratorContentChild = _t.first);
      }
    },
    viewQuery: function TestDir_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.signalViewChild, _c1, 5);
        i0.ɵɵviewQuery(_c1, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance();
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.decoratorViewChild = _t.first);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestDir,
      [
        {
          type: Directive,
          args: [{}]
        }
      ],
      null,
      {
        decoratorViewChild: [
          {
            type: ViewChild,
            args: ["locator1"]
          }
        ],
        signalViewChild: [{ type: i0.ViewChild, args: ["locator1", { isSignal: true }] }],
        decoratorContentChild: [
          {
            type: ContentChild,
            args: ["locator2"]
          }
        ],
        signalContentChild: [{ type: i0.ContentChild, args: ["locator2", { isSignal: true }] }]
      }
    );
})();
