import { Component, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Defer_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Hello ");
  }
}
export class TestPipe {
  transform() {
    return true;
  }
  static ɵfac = function TestPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "testPipe", type: TestPipe, pure: true });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestPipe,
      [
        {
          type: Pipe,
          args: [{ name: "testPipe" }]
        }
      ],
      null,
      null
    );
})();
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
    decls: 5,
    vars: 4,
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 0);
        i0.ɵɵdefer(2, 1);
        i0.ɵɵpipe(4, "testPipe");
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(" ", ctx.message, " ");
        i0.ɵɵadvance(2);
        i0.ɵɵdeferWhen(ctx.isVisible() && i0.ɵɵpipeBind1(4, 2, ctx.isReady));
      }
    },
    dependencies: [TestPipe],
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
    @defer (when isVisible() && (isReady | testPipe)) {
      Hello
    }
  `,
              imports: [TestPipe]
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
      filePath: "deferred_when_with_pipe.ts",
      lineNumber: 19
    });
})();
