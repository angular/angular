import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Main ");
  }
}
function MyApp_DeferPlaceholder_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "div")(2, "button", null, 0);
    i0.ɵɵtext(4, "Click me");
    i0.ɵɵelementEnd()()();
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
    decls: 5,
    vars: 1,
    consts: [["button", ""]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0)(
          2,
          MyApp_DeferPlaceholder_2_Template,
          5,
          0
        );
        i0.ɵɵdefer(3, 1, null, null, 2);
        i0.ɵɵdeferOnInteraction(2, -1);
        i0.ɵɵdeferPrefetchOnInteraction(2, -1);
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
    @defer (on interaction(button); prefetch on interaction(button)) {
      Main
    } @placeholder {
      <div>
        <div>
          <button #button>Click me</button>
        </div>
      </div>
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
      filePath: "deferred_interaction_placeholder_trigger.ts",
      lineNumber: 18
    });
})();
