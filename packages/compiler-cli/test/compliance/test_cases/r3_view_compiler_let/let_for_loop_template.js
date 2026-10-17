import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_1_For_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ɵ$index_3_r1 = ctx.$index;
    i0.ɵɵnextContext();
    const outerFirst_r2 = i0.ɵɵreadContextLet(0);
    const innerFirst_r3 = ɵ$index_3_r1 === 0;
    i0.ɵɵtextInterpolate1(" ", outerFirst_r2 || innerFirst_r3, " ");
  }
}
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_1_For_2_Template,
      1,
      1,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity
    );
  }
  if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ɵ$index_1_r5 = ctx.$index;
    i0.ɵɵstoreLet(ɵ$index_1_r5 === 0);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r4.children);
  }
}
export class MyApp {
  items = [];
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          3,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity
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
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @for (item of items; track item) {
      @let outerFirst = $first;

      @for (subitem of item.children; track subitem) {
        @let innerFirst = $first;

        {{outerFirst || innerFirst}}
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "let_for_loop.ts",
      lineNumber: 16
    });
})();
