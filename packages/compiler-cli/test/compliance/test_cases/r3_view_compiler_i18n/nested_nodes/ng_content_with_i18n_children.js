import { Component } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
function MyComponent_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, "span");
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵdomElement(2, "b");
    i0.ɵɵi18nEnd();
    i0.ɵɵdomElementEnd();
  }
}
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    ngContentSelectors: _c0,
    decls: 2,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_MY_ID$$NG_CONTENT_WITH_I18N_CHILDREN_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "a {$startBoldText}b{$closeBoldText} c",
            { "closeBoldText": "\uFFFD/#2\uFFFD", "startBoldText": "\uFFFD#2\uFFFD" },
            { original_code: { "closeBoldText": "</b>", "startBoldText": "<b>" } }
          );
        i18n_0 = MSG_EXTERNAL_MY_ID$$NG_CONTENT_WITH_I18N_CHILDREN_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:@@MY_ID:a ${"\uFFFD#2\uFFFD"}:START_BOLD_TEXT:b${"\uFFFD/#2\uFFFD"}:CLOSE_BOLD_TEXT: c`;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵprojection(0, 0, null, MyComponent_ProjectionFallback_0_Template, 3, 0);
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
    <ng-content>
      <span i18n="@@MY_ID">a <b>b</b> c</span>
    </ng-content>
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
      filePath: "ng_content_with_i18n_children.ts",
      lineNumber: 11
    });
})();
