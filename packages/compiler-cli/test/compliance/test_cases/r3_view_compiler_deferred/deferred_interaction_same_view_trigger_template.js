import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_1_Template(rf, ctx) {}
export class MyApp {
  message = "hello";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 10,
    vars: 1,
    consts: [["button", ""]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 0, 0);
        i0.ɵɵdefer(2, 1);
        i0.ɵɵdeferOnInteraction(7);
        i0.ɵɵdeferPrefetchOnInteraction(7);
        i0.ɵɵelementStart(4, "div")(5, "div")(6, "div")(7, "button", null, 0);
        i0.ɵɵtext(9, "Click me");
        i0.ɵɵelementEnd()()()();
      }
      if (rf & 2) {
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
    {{message}}
    @defer (on interaction(button); prefetch on interaction(button)) {}

    <div>
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
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
      filePath: "deferred_interaction_same_view_trigger.ts",
      lineNumber: 18
    });
})();
