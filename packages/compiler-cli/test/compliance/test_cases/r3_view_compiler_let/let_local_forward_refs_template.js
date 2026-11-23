import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 1,
    consts: [["name", ""]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, "input", null, 0);
      }
      if (rf & 2) {
        const name_r1 = i0.ɵɵreference(2);
        const message_r2 = "Hello, " + name_r1.value;
        i0.ɵɵtextInterpolate1(" ", message_r2, " ");
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
    @let message = 'Hello, ' + name.value;
    {{message}}
    <input #name>
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
      filePath: "let_local_forward_refs.ts",
      lineNumber: 10
    });
})();
