import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 0);
    i0.ɵɵlistener("click", function MyApp_For_3_Template_div_click_0_listener() {
      const ctx_r1 = i0.ɵɵrestoreView(_r1);
      const $index_r3 = ctx_r1.$index;
      const ɵ$index_4_r4 = ctx_r1.$index;
      const $count_r5 = ctx_r1.$count;
      const ctx_r5 = i0.ɵɵnextContext();
      return i0.ɵɵresetView(
        ctx_r5.log($index_r3, ɵ$index_4_r4 % 2 === 0, ɵ$index_4_r4 === 0, $count_r5)
      );
    });
    i0.ɵɵelementEnd();
  }
}
export class MyApp {
  message = "hello";
  items = [];
  log(..._) {}
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 4,
    vars: 1,
    consts: [[3, "click"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          1,
          0,
          "div",
          null,
          i0.ɵɵrepeaterTrackByIdentity
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance();
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
    <div>
      {{message}}
      @for (item of items; track item; let ev = $even) {
        <div (click)="log($index, ev, $first, $count)"></div>
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
      filePath: "for_template_variables_listener.ts",
      lineNumber: 14
    });
})();
