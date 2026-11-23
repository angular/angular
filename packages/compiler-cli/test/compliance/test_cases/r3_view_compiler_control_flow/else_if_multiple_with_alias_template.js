import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" One: ", ctx, " ");
  }
}
function MyApp_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" Two: ", ctx_r0.two, " ");
  }
}
function MyApp_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" Three: ", ctx, " ");
  }
}
function MyApp_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(" Four: ", ctx, " ");
  }
}
function MyApp_Conditional_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" Five: ", ctx_r0.five, " ");
  }
}
export class MyApp {
  message = "hello";
  one = 1;
  two = 2;
  three = 3;
  four = 4;
  five = 5;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 7,
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
        )(4, MyApp_Conditional_4_Template, 1, 1)(5, MyApp_Conditional_5_Template, 1, 1)(
          6,
          MyApp_Conditional_6_Template,
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
        i0.ɵɵconditional(
          (tmp_1_0 = ctx.one)
            ? 2
            : ctx.two
              ? 3
              : (tmp_1_0 = ctx.three)
                ? 4
                : (tmp_1_0 = ctx.four)
                  ? 5
                  : ctx.five
                    ? 6
                    : -1,
          tmp_1_0
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
      @if (one; as foo) {
        One: {{foo}}
      } @else if (two) {
        Two: {{two}}
      } @else if (three; as bar) {
        Three: {{bar}}
      } @else if (four; as baz) {
        Four: {{baz}}
      } @else if (five) {
        Five: {{five}}
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
      filePath: "else_if_multiple_with_alias.ts",
      lineNumber: 21
    });
})();
