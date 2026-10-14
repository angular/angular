import {
  contentChild,
  contentChildren,
  Directive,
  forwardRef,
  viewChild,
  viewChildren
} from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["locatorC"];
const _c1 = ["locatorD"];
const _c2 = ["locatorF", "locatorG"];
const _c3 = ["locatorA"];
const _c4 = ["locatorB"];
const _c5 = ["locatorE"];
export class SomeToken {}
const nonAnalyzableRefersToString = "a, b, c";
export class TestDir {
  query1 = viewChild(
    "locatorA" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "query1" }] : /* istanbul ignore next */ [])
  );
  query2 = viewChildren(
    "locatorB" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "query2" }] : /* istanbul ignore next */ [])
  );
  query3 = contentChild(
    "locatorC" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "query3" }] : /* istanbul ignore next */ [])
  );
  query4 = contentChildren(
    "locatorD" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "query4" }] : /* istanbul ignore next */ [])
  );
  query5 = viewChild(
    forwardRef(() => SomeToken) /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "query5" }] : /* istanbul ignore next */ [])
  );
  query6 = viewChildren(
    SomeToken /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "query6" }] : /* istanbul ignore next */ [])
  );
  query7 = viewChild("locatorE", {
    ...(ngDevMode ? { debugName: "query7" } : /* istanbul ignore next */ {}),
    read: SomeToken
  });
  query8 = contentChildren("locatorF, locatorG", {
    ...(ngDevMode ? { debugName: "query8" } : /* istanbul ignore next */ {}),
    descendants: true
  });
  query9 = contentChildren(nonAnalyzableRefersToString, {
    ...(ngDevMode ? { debugName: "query9" } : /* istanbul ignore next */ {}),
    descendants: true
  });
  static ɵfac = function TestDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    contentQueries: function TestDir_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5)(dirIndex, ctx.query4, _c1, 4)(
          dirIndex,
          ctx.query8,
          _c2,
          5
        )(dirIndex, ctx.query9, nonAnalyzableRefersToString, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(4);
      }
    },
    viewQuery: function TestDir_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.query1, _c3, 5)(ctx.query2, _c4, 5)(ctx.query5, SomeToken, 5)(
          ctx.query6,
          SomeToken,
          5
        )(ctx.query7, _c5, 5, SomeToken);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(5);
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
        query1: [{ type: i0.ViewChild, args: ["locatorA", { isSignal: true }] }],
        query2: [{ type: i0.ViewChildren, args: ["locatorB", { isSignal: true }] }],
        query3: [{ type: i0.ContentChild, args: ["locatorC", { isSignal: true }] }],
        query4: [{ type: i0.ContentChildren, args: ["locatorD", { isSignal: true }] }],
        query5: [{ type: i0.ViewChild, args: [forwardRef(() => SomeToken), { isSignal: true }] }],
        query6: [
          { type: i0.ViewChildren, args: [i0.forwardRef(() => SomeToken), { isSignal: true }] }
        ],
        query7: [
          { type: i0.ViewChild, args: ["locatorE", { ...{ read: SomeToken }, isSignal: true }] }
        ],
        query8: [
          {
            type: i0.ContentChildren,
            args: ["locatorF, locatorG", { ...{ descendants: true }, isSignal: true }]
          }
        ],
        query9: [
          {
            type: i0.ContentChildren,
            args: [
              i0.forwardRef(() => nonAnalyzableRefersToString),
              { ...{ descendants: true }, isSignal: true }
            ]
          }
        ]
      }
    );
})();
