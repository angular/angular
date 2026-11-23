import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " foo ");
  }
}
function MyApp_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " foo ");
  }
}
function MyApp_Conditional_1_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " foo ");
  }
}
function MyApp_Conditional_1_Conditional_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const inner_r1 = i0.ɵɵnextContext();
    const root_r2 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate4(
      " Innermost: ",
      ctx_r2.value(),
      "/",
      root_r2,
      "/",
      inner_r1,
      "/",
      ctx,
      " "
    );
  }
}
function MyApp_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_1_Conditional_2_Conditional_1_Template, 1, 0)(
      2,
      MyApp_Conditional_1_Conditional_2_Conditional_2_Template,
      1,
      4
    );
  }
  if (rf & 2) {
    let tmp_5_0;
    const root_r2 = i0.ɵɵnextContext();
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate3(" Inner: ", ctx_r2.value(), "/", root_r2, "/", ctx, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.foo ? 1 : (tmp_5_0 = ctx_r2.value()) ? 2 : -1, tmp_5_0);
  }
}
function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_1_Conditional_1_Template, 1, 0)(
      2,
      MyApp_Conditional_1_Conditional_2_Template,
      3,
      4
    );
  }
  if (rf & 2) {
    let tmp_3_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(" Root: ", ctx_r2.value(), "/", ctx, " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.foo ? 1 : (tmp_3_0 = ctx_r2.value()) ? 2 : -1, tmp_3_0);
  }
}
export class MyApp {
  foo = false;
  value = () => 1;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 1,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 0)(
          1,
          MyApp_Conditional_1_Template,
          3,
          3
        );
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵconditional(ctx.foo ? 0 : (tmp_0_0 = ctx.value()) ? 1 : -1, tmp_0_0);
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
    @if (foo) {
      foo
    } @else if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (foo) {
        foo
      } @else if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (foo) {
          foo
        } @else if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
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
      filePath: "else_if_nested_with_alias.ts",
      lineNumber: 24
    });
})();
