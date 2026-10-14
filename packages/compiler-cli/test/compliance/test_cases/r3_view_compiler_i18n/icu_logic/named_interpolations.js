import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  gender = "male";
  weight = 1;
  height = 1;
  age = 1;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 4,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6318060397235942326$$NAMED_INTERPOLATIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}"
          );
        i18n_0 = MSG_EXTERNAL_6318060397235942326$$NAMED_INTERPOLATIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male {PH_A}} female {female {PH_B}} other {other {PH_WITH_SPACES}}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        "PH_WITH_SPACES": "\uFFFD3\uFFFD",
        "PH_A": "\uFFFD1\uFFFD",
        "PH_B": "\uFFFD2\uFFFD",
        "VAR_SELECT": "\uFFFD0\uFFFD"
      });
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
        i0.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height)(ctx.age);
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
  <div i18n>{
    gender,
    select,
      male {male {{ weight // i18n(ph="PH_A") }}}
      female {female {{ height // i18n(ph="PH_B") }}}
      other {other {{ age // i18n(ph="PH WITH SPACES") }}}
  }</div>
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
      lineNumber: 16
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
