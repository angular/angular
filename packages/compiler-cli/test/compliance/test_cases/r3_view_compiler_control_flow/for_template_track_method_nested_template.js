import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_ng_template_2_For_1_Template(rf, ctx) {}
function MyApp_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵrepeaterCreate(
      0,
      MyApp_ng_template_2_For_1_Template,
      0,
      0,
      null,
      null,
      i0.ɵɵcomponentInstance().trackFn,
      true
    );
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r0.items);
  }
}
export class MyApp {
  message = "hello";
  items = [{ name: "one" }, { name: "two" }, { name: "three" }];
  trackFn(_index, item) {
    return item;
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 3,
    vars: 1,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵtemplate(2, MyApp_ng_template_2_Template, 2, 0, "ng-template");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
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
      <ng-template>
        @for (item of items; track trackFn($index, item)) {}
      </ng-template>
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
      filePath: "for_template_track_method_nested.ts",
      lineNumber: 14
    });
})();
