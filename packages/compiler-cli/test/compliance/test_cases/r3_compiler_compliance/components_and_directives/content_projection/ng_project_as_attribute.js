import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "div", 1);
  }
}
export class MyApp {
  show = true;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [
      ["ngProjectAs", ".someclass", 5, ["", 8, "someclass"], 4, "ngIf"],
      ["ngProjectAs", ".someclass", 5, ["", 8, "someclass"]]
    ],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyApp_div_0_Template, 1, 0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.show);
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
              selector: "my-app",
              template: '<div *ngIf="show" ngProjectAs=".someclass"></div>',
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
      filePath: "ng_project_as_attribute.ts",
      lineNumber: 7
    });
})();
