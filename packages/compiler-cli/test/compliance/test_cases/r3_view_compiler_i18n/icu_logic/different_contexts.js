import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_span_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "span");
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.age);
    i0.ɵɵi18nApply(0);
  }
}
export class MyComponent {
  gender = "female";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 3,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$DIFFERENT_CONTEXTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$DIFFERENT_CONTEXTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" });
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7068143081688428291$$DIFFERENT_CONTEXTS_TS_1 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}");
        i18n_1 = MSG_EXTERNAL_7068143081688428291$$DIFFERENT_CONTEXTS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0:1\uFFFD" });
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6305631112932538342$$DIFFERENT_CONTEXTS_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            " {$icu} {$startTagSpan} {$icu_1} {$closeTagSpan}",
            {
              "closeTagSpan": "\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD",
              "icu": i18n_0,
              "icu_1": i18n_1,
              "startTagSpan": "\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "icu": "{gender, select, male {male} female {female} other {other}}",
                "icu_1": "{age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}",
                "startTagSpan": '<span *ngIf="ageVisible">'
              }
            }
          );
        i18n_2 = MSG_EXTERNAL_6305631112932538342$$DIFFERENT_CONTEXTS_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` ${i18n_0}:ICU@@7670372064920373295: ${"\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_SPAN: ${i18n_1}:ICU_1@@4590395557003415341: ${"\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_SPAN:`;
      }
      return [i18n_2, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 1, "span", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty("ngIf", ctx.ageVisible);
        i0.ɵɵi18nExp(ctx.gender);
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
  {gender, select, male {male} female {female} other {other}}
  <span *ngIf="ageVisible">
    {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other}}
  </span>
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
      filePath: "different_contexts.ts",
      lineNumber: 15
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
