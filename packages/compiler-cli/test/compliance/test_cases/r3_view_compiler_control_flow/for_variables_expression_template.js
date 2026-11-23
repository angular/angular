import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ɵ$index_1_r1 = ctx.$index;
    i0.ɵɵtextInterpolate1(" ", (ɵ$index_1_r1 % 2 !== 0) + "", " ");
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
    standalone: false,
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          1,
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
              template: `@for (item of items; track item) {
    {{$odd + ''}}
  }`,
              standalone: false
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
      filePath: "for_variables_expression.ts",
      lineNumber: 9
    });
})();
