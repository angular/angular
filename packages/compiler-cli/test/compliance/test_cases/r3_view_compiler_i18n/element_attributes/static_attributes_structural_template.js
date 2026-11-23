import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelement(0, "div", 1);
  }
}
export class MyComponent {
  exp = true;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8809028065680254561$$STATIC_ATTRIBUTES_STRUCTURAL_TS_0 =
          /* @ts-ignore */
          goog.getMsg("introduction");
        i18n_0 = MSG_EXTERNAL_8809028065680254561$$STATIC_ATTRIBUTES_STRUCTURAL_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:m|d:introduction`;
      }
      return [
        ["id", "static", "title", i18n_0, 4, "ngIf"],
        ["id", "static", "title", i18n_0]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 1, 0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.exp);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component",
              template: `
    <div *ngIf="exp" id="static" i18n-title="m|d" title="introduction"></div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "static_attributes_structural.ts",
      lineNumber: 10
    });
})();
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();
