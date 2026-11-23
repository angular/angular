import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const arrowFn0 = (ctx, view) => () => {
  const ctx_r0 = i0.ɵɵrestoreView(view);
  const $index_r2 = ctx_r0.$index;
  const ɵ$index_2_r3 = ctx_r0.$index;
  const ɵ$index_1_r4 = i0.ɵɵnextContext().$index;
  return i0.ɵɵresetView(ɵ$index_1_r4 % 2 === 0 || ɵ$index_2_r3 % 2 === 0 || $index_r2);
};
function TestComp_For_1_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵarrowFunction(1, arrowFn0, ctx)(), " ");
  }
}
function TestComp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(
      0,
      TestComp_For_1_For_1_Template,
      1,
      2,
      null,
      null,
      i0.ɵɵrepeaterTrackByIndex
    );
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵrepeater(item_r5.subItems);
  }
}
export class TestComp {
  items = [
    { name: "one", subItems: ["sub one", "sub two", "sub three"] },
    { name: "two", subItems: ["sub one", "sub two", "sub three"] },
    { name: "three", subItems: ["sub one", "sub two", "sub three"] }
  ];
  static ɵfac = function TestComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 0,
    template: function TestComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          TestComp_For_1_Template,
          2,
          0,
          null,
          null,
          i0.ɵɵrepeaterTrackByIndex
        );
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
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
              template: `
    @for (item of items; track $index; let outerEven = $even) {
      @for (subitem of item.subItems; track $index) {
        {{(() => outerEven || $even || $index)()}}
      }
    }
  `
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: "TestComp",
      filePath: "arrow_function_loop_variables.ts",
      lineNumber: 12
    });
})();
