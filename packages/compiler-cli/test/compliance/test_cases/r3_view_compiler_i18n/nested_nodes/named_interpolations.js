import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  valueA = "";
  valueB = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8886186367501632276$$NAMED_INTERPOLATIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Named interpolation: {$phA} Named interpolation with spaces: {$phB} ",
            { "phB": "\uFFFD1\uFFFD", "phA": "\uFFFD0\uFFFD" },
            {
              original_code: {
                "phB": '{{ valueB // i18n(ph="PH B") }}',
                "phA": '{{ valueA // i18n(ph="PH_A") }}'
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_8886186367501632276$$NAMED_INTERPOLATIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Named interpolation: ${"\uFFFD0\uFFFD"}:PH_A: Named interpolation with spaces: ${"\uFFFD1\uFFFD"}:PH_B: `;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.valueA)(ctx.valueB);
        i0.ɵɵi18nApply(1);
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
  <div i18n>
    Named interpolation: {{ valueA // i18n(ph="PH_A") }}
    Named interpolation with spaces: {{ valueB // i18n(ph="PH B") }}
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "named_interpolations.ts",
      lineNumber: 13
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
