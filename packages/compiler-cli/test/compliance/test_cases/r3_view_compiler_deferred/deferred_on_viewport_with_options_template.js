import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.message, " ");
  }
}
function MyApp_DeferPlaceholder_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "button", null, 0);
    i0.ɵɵtext(2, "Click me");
    i0.ɵɵdomElementEnd();
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
    decls: 5,
    vars: 1,
    consts: [["button", ""]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1)(
          2,
          MyApp_DeferPlaceholder_2_Template,
          3,
          0
        );
        i0.ɵɵdefer(3, 1, null, null, 2);
        i0.ɵɵdeferOnViewport(0, -1, { rootMargin: "123px", scrollMargin: "456px", threshold: 59 });
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
    @defer (on viewport({trigger: button, rootMargin: '123px', scrollMargin: '456px', threshold: 59})) {
      {{message}}
    } @placeholder {
      <button #button>Click me</button>
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
      filePath: "deferred_on_viewport_with_options.ts",
      lineNumber: 13
    });
})();
