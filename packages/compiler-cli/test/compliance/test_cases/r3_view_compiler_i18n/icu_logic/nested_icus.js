import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  age = 1;
  gender = "male";
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
        const MSG_EXTERNAL_343563413083115114$$NESTED_ICUS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}"
          );
        i18n_0 = MSG_EXTERNAL_343563413083115114$$NESTED_ICUS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT_1, select, male {male of age: {VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}} female {female} other {other}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        "VAR_SELECT": "\uFFFD0\uFFFD",
        "VAR_SELECT_1": "\uFFFD1\uFFFD"
      });
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1913020609154054897$$NESTED_ICUS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            " {$icu} ",
            { "icu": i18n_0 },
            {
              original_code: {
                "icu":
                  "{gender, select,\n      male {male of age: {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}}\n      female {female}\n      other {other}\n    }"
              }
            }
          );
        i18n_1 = MSG_EXTERNAL_1913020609154054897$$NESTED_ICUS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize` ${i18n_0}:ICU@@2960440207608193372: `;
      }
      return [i18n_1];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.age)(ctx.gender);
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
    {gender, select,
      male {male of age: {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}}
      female {female}
      other {other}
    }
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
      filePath: "nested_icus.ts",
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
