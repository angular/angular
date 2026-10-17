import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Case_2_Template(rf, ctx) {}
function MyApp_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " case 01 ");
  }
}
function MyApp_Case_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " case 2 ");
  }
}
function MyApp_Case_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " default ");
  }
}
export class MyApp {
  message = "hello";
  value() {
    return 1;
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 6,
    vars: 2,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Case_2_Template, 0, 0)(3, MyApp_Case_3_Template, 1, 0)(
          4,
          MyApp_Case_4_Template,
          1,
          0
        )(5, MyApp_Case_5_Template, 1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional(
          (tmp_1_0 = ctx.value()) === -1
            ? 2
            : tmp_1_0 === 0
              ? 3
              : tmp_1_0 === 1
                ? 3
                : tmp_1_0 === 2
                  ? 4
                  : 5
        );
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
    <div>
      {{message}}
      @switch (value()) {
        @case (-1) {}
        @case (0) @case(1) {
          case 01
        }
        @case (2) {
          case 2
        }
        @default {
          default
        }
      }
    </div>
  `,
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
      filePath: "switch_multiple_cases.ts",
      lineNumber: 23
    });
})();
