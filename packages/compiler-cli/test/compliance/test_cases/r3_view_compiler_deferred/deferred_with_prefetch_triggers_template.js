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
    i0.ɵɵelementStart(0, "button", null, 0);
    i0.ɵɵtext(2, "Click me");
    i0.ɵɵelementEnd();
  }
}
export class MyApp {
  message = "hello";
  isReady = true;
  isVisible() {
    return false;
  }
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 5,
    vars: 2,
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
        i0.ɵɵdeferPrefetchOnIdle();
        i0.ɵɵdeferPrefetchOnImmediate();
        i0.ɵɵdeferPrefetchOnTimer(1337);
        i0.ɵɵdeferPrefetchOnHover(0, -1);
        i0.ɵɵdeferPrefetchOnInteraction(0, -1);
        i0.ɵɵdeferPrefetchOnViewport(0, -1);
        i0.ɵɵdeferOnIdle();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance(3);
        i0.ɵɵdeferPrefetchWhen(ctx.isVisible() || ctx.isReady);
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
    @defer (
      prefetch when isVisible() || isReady;
      prefetch on idle, timer(1337);
      prefetch on immediate, hover(button);
      prefetch on interaction(button);
      prefetch on viewport(button)) {
        {{message}}
      } @placeholder {
        <button #button>Click me</button>
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
      filePath: "deferred_with_prefetch_triggers.ts",
      lineNumber: 19
    });
})();
