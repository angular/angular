import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
  }
}
function MyComponent_ng_template_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 1, 1);
  }
}
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 6,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2794571749861951181$$SIBLING_I18N_BLOCKS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagNgTemplate}Content A{$closeTagNgTemplate}",
            { "closeTagNgTemplate": "\uFFFD/*2:1\uFFFD", "startTagNgTemplate": "\uFFFD*2:1\uFFFD" },
            {
              original_code: {
                "closeTagNgTemplate": "</ng-template>",
                "startTagNgTemplate": "<ng-template>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_2794571749861951181$$SIBLING_I18N_BLOCKS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD*2:1\uFFFD"}:START_TAG_NG_TEMPLATE:Content A${"\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3741326655422864774$$SIBLING_I18N_BLOCKS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagNgTemplate}Content B{$closeTagNgTemplate}",
            { "closeTagNgTemplate": "\uFFFD/*5:1\uFFFD", "startTagNgTemplate": "\uFFFD*5:1\uFFFD" },
            {
              original_code: {
                "closeTagNgTemplate": "</ng-template>",
                "startTagNgTemplate": "<ng-template>"
              }
            }
          );
        i18n_1 = MSG_EXTERNAL_3741326655422864774$$SIBLING_I18N_BLOCKS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${"\uFFFD*5:1\uFFFD"}:START_TAG_NG_TEMPLATE:Content B${"\uFFFD/*5:1\uFFFD"}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomTemplate(2, MyComponent_ng_template_2_Template, 1, 0, "ng-template");
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(3, "div");
        i0.ɵɵi18nStart(4, 1);
        i0.ɵɵdomTemplate(5, MyComponent_ng_template_5_Template, 1, 0, "ng-template");
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
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
    <ng-template>Content A</ng-template>
  </div>
  <div i18n>
    <ng-template>Content B</ng-template>
  </div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "sibling_i18n_blocks.ts",
      lineNumber: 14
    });
})();
