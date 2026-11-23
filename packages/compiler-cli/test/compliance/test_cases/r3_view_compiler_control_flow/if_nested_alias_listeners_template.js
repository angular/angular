import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_0_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 0);
    i0.ɵɵlistener(
      "click",
      function MyApp_Conditional_0_Conditional_1_Conditional_1_Template_button_click_0_listener() {
        const innermost_r7 = i0.ɵɵrestoreView(_r6);
        const inner_r5 = i0.ɵɵnextContext();
        const root_r2 = i0.ɵɵnextContext();
        const ctx_r2 = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r2.log(ctx_r2.value(), root_r2, inner_r5, innermost_r7));
      }
    );
    i0.ɵɵelementEnd();
  }
}
function MyApp_Conditional_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 0);
    i0.ɵɵlistener(
      "click",
      function MyApp_Conditional_0_Conditional_1_Template_button_click_0_listener() {
        const inner_r5 = i0.ɵɵrestoreView(_r4);
        const root_r2 = i0.ɵɵnextContext();
        const ctx_r2 = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r2.log(ctx_r2.value(), root_r2, inner_r5));
      }
    );
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(
      1,
      MyApp_Conditional_0_Conditional_1_Conditional_1_Template,
      1,
      0,
      "button"
    );
  }
  if (rf & 2) {
    let tmp_4_0;
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_4_0 = ctx_r2.value()) ? 1 : -1, tmp_4_0);
  }
}
function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 0);
    i0.ɵɵlistener("click", function MyApp_Conditional_0_Template_button_click_0_listener() {
      const root_r2 = i0.ɵɵrestoreView(_r1);
      const ctx_r2 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r2.log(ctx_r2.value(), root_r2));
    });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Template, 2, 1);
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx_r2.value()) ? 1 : -1, tmp_2_0);
  }
}
export class MyApp {
  value = () => 1;
  log(..._) {}
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, "click"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 1);
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵconditional((tmp_0_0 = ctx.value()) ? 0 : -1, tmp_0_0);
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
    @if (value(); as root) {
      <button (click)="log(value(), root)"></button>

      @if (value(); as inner) {
        <button (click)="log(value(), root, inner)"></button>

        @if (value(); as innermost) {
          <button (click)="log(value(), root, inner, innermost)"></button>
        }
      }
    }
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
      filePath: "if_nested_alias_listeners.ts",
      lineNumber: 19
    });
})();
