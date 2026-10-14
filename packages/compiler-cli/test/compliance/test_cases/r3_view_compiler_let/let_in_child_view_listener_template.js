import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_1_Conditional_1_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵdomElementStart(1, "button", 0);
    i0.ɵɵdomListener(
      "click",
      function MyApp_ng_template_1_Conditional_1_Case_1_Template_button_click_1_listener() {
        i0.ɵɵrestoreView(_r1);
        const four_r2 = i0.ɵɵreadContextLet(0);
        i0.ɵɵnextContext();
        const three_r3 = i0.ɵɵreadContextLet(0);
        i0.ɵɵnextContext();
        const two_r4 = i0.ɵɵreadContextLet(0);
        const ctx_r4 = i0.ɵɵnextContext();
        const one_r6 = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView(ctx_r4.callback(one_r6, two_r4, three_r3, four_r2));
      }
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const three_r3 = i0.ɵɵreadContextLet(0);
    i0.ɵɵstoreLet(three_r3 + 1);
  }
}
function MyApp_ng_template_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, MyApp_ng_template_1_Conditional_1_Case_1_Template, 2, 1, "button");
  }
  if (rf & 2) {
    let tmp_5_0;
    i0.ɵɵnextContext();
    const two_r4 = i0.ɵɵreadContextLet(0);
    i0.ɵɵstoreLet(two_r4 + 1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_5_0 = 1) === 1 ? 1 : -1);
  }
}
function MyApp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, MyApp_ng_template_1_Conditional_1_Template, 2, 2);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const one_r6 = i0.ɵɵreadContextLet(0);
    i0.ɵɵstoreLet(one_r6 + 1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(true ? 1 : -1);
  }
}
export class MyApp {
  value = 1;
  callback(one, two, three, four) {
    console.log(one, two, three, four);
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 1,
    consts: [[3, "click"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵdomTemplate(1, MyApp_ng_template_1_Template, 2, 2, "ng-template");
      }
      if (rf & 2) {
        i0.ɵɵstoreLet(ctx.value + 1);
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
    @let one = value + 1;

    <ng-template>
      @let two = one + 1;

      @if (true) {
        @let three = two + 1;

        @switch (1) {
          @case (1) {
            @let four = three + 1;
            <button (click)="callback(one, two, three, four)"></button>
          }
        }
      }
    </ng-template>
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
      filePath: "let_in_child_view_listener.ts",
      lineNumber: 23
    });
})();
