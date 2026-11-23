import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", ctx, " ");
  }
}
function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", ctx, " ");
  }
}
export class MyApp {
  message = "hello";
  one = false;
  two = 2;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 2,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 1)(
          3,
          MyApp_Conditional_3_Template,
          1,
          1
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional((tmp_1_0 = ctx.one) ? 2 : (tmp_1_0 = ctx.two) ? 3 : -1, tmp_1_0);
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
      @if (one; as alias) {
        {{alias}}
      } @else if (two; as alias) {
        {{alias}}
      }
    </div>
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
      filePath: "else_if_with_same_alias.ts",
      lineNumber: 15
    });
})();
