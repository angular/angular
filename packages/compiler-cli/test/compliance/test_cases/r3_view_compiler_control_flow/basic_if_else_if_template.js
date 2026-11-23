import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " one ");
  }
}
function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " two ");
  }
}
function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " three ");
  }
}
function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " four ");
  }
}
export class MyApp {
  message = "hello";
  value = () => 1;
  otherValue = () => 2;
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
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 0)(
          3,
          MyApp_Conditional_3_Template,
          1,
          0
        )(4, MyApp_Conditional_4_Template, 1, 0)(5, MyApp_Conditional_5_Template, 1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.value() === 1 ? 2 : ctx.otherValue() === 2 ? 3 : ctx.message ? 4 : 5);
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
      @if (value() === 1) {
        one
      } @else if (otherValue() === 2) {
        two
      } @else if (message) {
        three
      } @else {
        four
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
      filePath: "basic_if_else_if.ts",
      lineNumber: 20
    });
})();
