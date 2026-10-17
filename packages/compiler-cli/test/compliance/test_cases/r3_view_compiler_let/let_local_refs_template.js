import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 5,
    vars: 1,
    consts: [
      ["name", ""],
      ["lastName", ""]
    ],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "input", null, 0)(2, "input", null, 1);
        i0.ɵɵtext(4);
      }
      if (rf & 2) {
        const name_r1 = i0.ɵɵreference(1);
        const lastName_r2 = i0.ɵɵreference(3);
        const fullName_r3 = name_r1.value + " " + lastName_r2.value;
        i0.ɵɵadvance(4);
        i0.ɵɵtextInterpolate1(" Hello, ", fullName_r3, " ");
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
    <input #name>
    <input #lastName>

    @let fullName = name.value + ' ' + lastName.value;
    Hello, {{fullName}}
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
      filePath: "let_local_refs.ts",
      lineNumber: 12
    });
})();
