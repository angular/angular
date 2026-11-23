import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  value;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_NON_LEGACY_NORMALIZED_TS_0 =
          /* @ts-ignore */
          goog.getMsg("abc\ndef");
        i18n_0 = MSG_EXTERNAL_7326958852138509669$$EXTERNAL_TEMPLATE_NON_LEGACY_NORMALIZED_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`abc
def`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2056861121373082280$$EXTERNAL_TEMPLATE_NON_LEGACY_NORMALIZED_TS_1 =
          /* @ts-ignore */
          goog.getMsg("{VAR_SELECT, select, =0 {zero\n    }}");
        i18n_1 = MSG_EXTERNAL_2056861121373082280$$EXTERNAL_TEMPLATE_NON_LEGACY_NORMALIZED_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, =0 {zero
    }}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { "VAR_SELECT": "\uFFFD0\uFFFD" });
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6752545234037626269$$EXTERNAL_TEMPLATE_NON_LEGACY_NORMALIZED_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            " Some Message {$icu}",
            { "icu": i18n_1 },
            { original_code: { "icu": … } }
          );
        i18n_2 = MSG_EXTERNAL_6752545234037626269$$EXTERNAL_TEMPLATE_NON_LEGACY_NORMALIZED_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` Some Message ${i18n_1}:ICU@@2416068396348331473:`;
      }
      return [i18n_2, ["title", i18n_0]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 1);
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.value);
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
              standalone: false,
              template:
                '<!--\n  NOTE: This template has escaped `\\r\\n` line-endings markers that will be converted to real `\\r\\n` line-ending chars when loaded from the test file-system.\n        This conversion happens in the monkeyPatchReadFile() function, which changes `fs.readFile()`.\n-->\n<div title="abc\r\ndef" i18n-title i18n>\r\n  Some Message\r\n  {\r\n    value,\r\n    select,\r\n    =0 {\r\n      zero\r\n    }\r\n  }</div>'
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
      filePath: "external_template_non_legacy_normalized.ts",
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
