import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, "Deferred content");
  }
}
export class MyApp {
  message = "hello";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 7,
    vars: 1,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1);
        i0.ɵɵdomTemplate(2, MyApp_Defer_2_Template, 1, 0);
        i0.ɵɵdefer(3, 2);
        i0.ɵɵdeferOnIdle();
        i0.ɵɵelementStart(5, "p");
        i0.ɵɵtext(6, "Content after defer block");
        i0.ɵɵelementEnd()();
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
      @defer {Deferred content}
      <p>Content after defer block</p>
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
      filePath: "basic_deferred.ts",
      lineNumber: 13
    });
})();
