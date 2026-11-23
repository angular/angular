import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  count = 0;
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
        const MSG_EXTERNAL_199763560911211963$$KEYWORD_SPACES_TS_0 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT , select , 1 {one} other {more than one}}");
        i18n_0 = MSG_EXTERNAL_199763560911211963$$KEYWORD_SPACES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT , select , 1 {one} other {more than one}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { "VAR_SELECT": "\uFFFD0\uFFFD" });
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3383986062053865025$$KEYWORD_SPACES_TS_1 =
          /* @ts-ignore */
          goog.getMsg("{VAR_PLURAL , plural , =1 {one} other {more than one}}");
        i18n_1 = MSG_EXTERNAL_3383986062053865025$$KEYWORD_SPACES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_PLURAL , plural , =1 {one} other {more than one}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_PLURAL": "\uFFFD1\uFFFD" });
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6804521423144261079$$KEYWORD_SPACES_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            " {$icu} {$icu_1} ",
            { "icu": i18n_0, "icu_1": i18n_1 },
            {
              original_code: {
                "icu": "{count, select , 1 {one} other {more than one}}",
                "icu_1": "{count, plural , =1 {one} other {more than one}}"
              }
            }
          );
        i18n_2 = MSG_EXTERNAL_6804521423144261079$$KEYWORD_SPACES_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` ${i18n_0}:ICU@@4297240864973290312: ${i18n_1}:ICU_1@@149492185132484300: `;
      }
      return [i18n_2];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.count)(ctx.count);
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
    {count, select , 1 {one} other {more than one}}
    {count, plural , =1 {one} other {more than one}}
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
      filePath: "keyword_spaces.ts",
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
