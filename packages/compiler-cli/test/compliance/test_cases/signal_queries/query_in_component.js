import { Component, contentChild, contentChildren, viewChild, viewChildren } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["locatorC"];
const _c1 = ["locatorD"];
const _c2 = ["locatorA"];
const _c3 = ["locatorB"];
export class TestComp {
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
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    contentQueries: function TestComp_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        i0.ɵɵcontentQuerySignal(dirIndex, ctx.query3, _c0, 5)(dirIndex, ctx.query4, _c1, 4);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(2);
      }
    },
    viewQuery: function TestComp_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuerySignal(ctx.query1, _c2, 5)(ctx.query2, _c3, 5);
      }
      if (rf & 2) {
        i0.ɵɵqueryAdvance(2);
      }
    },
    decls: 1,
    vars: 0,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Works");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestComp,
      [
        {
          type: Component,
          args: [
            {
              template: "Works"
            }
          ]
        }
      ],
      null,
      {
        query1: [{ type: i0.ViewChild, args: ["locatorA", { isSignal: true }] }],
        query2: [{ type: i0.ViewChildren, args: ["locatorB", { isSignal: true }] }],
        query3: [{ type: i0.ContentChild, args: ["locatorC", { isSignal: true }] }],
        query4: [{ type: i0.ContentChildren, args: ["locatorD", { isSignal: true }] }]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "query_in_component.ts",
      lineNumber: 6
    });
})();
