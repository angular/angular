import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.gender);
    i0.ɵɵi18nApply(0);
  }
}
export class MyComponent {
  gender = "male";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 4,
    vars: 3,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_0;
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
        const MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_1 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_1 = MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD1\uFFFD" });
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_2 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, male {male} female {female} other {other}}");
        i18n_2 = MSG_EXTERNAL_7842238767399919809$$SHARED_PLACEHOLDER_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_2 = i0.ɵɵi18nPostprocess(i18n_2, { "VAR_SELECT": "\uFFFD0:1\uFFFD" });
      let i18n_3;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_795316458693634260$$SHARED_PLACEHOLDER_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            " {$icu} {$startTagDiv} {$icu} {$closeTagDiv}{$startTagDiv_1} {$icu} {$closeTagDiv}",
            {
              "closeTagDiv": "[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]",
              "icu": "\uFFFDI18N_EXP_ICU\uFFFD",
              "startTagDiv": "\uFFFD#2\uFFFD",
              "startTagDiv_1": "\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD"
            },
            {
              original_code: {
                "closeTagDiv": "</div>",
                "icu": "{gender, select, male {male} female {female} other {other}}",
                "startTagDiv": "<div>",
                "startTagDiv_1": '<div *ngIf="visible">'
              }
            }
          );
        i18n_3 = MSG_EXTERNAL_795316458693634260$$SHARED_PLACEHOLDER_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize` ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU@@7670372064920373295: ${"\uFFFD#2\uFFFD"}:START_TAG_DIV: ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU@@7670372064920373295: ${"[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]"}:CLOSE_TAG_DIV:${"\uFFFD*3:1\uFFFD\uFFFD#1:1\uFFFD"}:START_TAG_DIV_1: ${"\uFFFDI18N_EXP_ICU\uFFFD"}:ICU@@7670372064920373295: ${"[\uFFFD/#2\uFFFD|\uFFFD/#1:1\uFFFD\uFFFD/*3:1\uFFFD]"}:CLOSE_TAG_DIV:`;
      }
      i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { "ICU": [i18n_0, i18n_1, i18n_2] });
      return [i18n_3, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "div");
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 2, 1, "div", 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵproperty("ngIf", ctx.visible);
        i0.ɵɵi18nExp(ctx.gender)(ctx.gender);
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
    <div>
      {gender, select, male {male} female {female} other {other}}
    </div>
    <div *ngIf="visible">
      {gender, select, male {male} female {female} other {other}}
    </div>
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
      filePath: "shared_placeholder.ts",
      lineNumber: 18
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
