import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 5,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5871145577455911624$$PRESERVE_INNER_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "\n    Some text\n    {$startTagSpan}Text inside span{$closeTagSpan}\n  ",
            { "closeTagSpan": "\uFFFD/#3\uFFFD", "startTagSpan": "\uFFFD#3\uFFFD" },
            { original_code: { "closeTagSpan": "</span>", "startTagSpan": "<span>" } }
          );
        i18n_0 = MSG_EXTERNAL_5871145577455911624$$PRESERVE_INNER_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`
    Some text
    ${"\uFFFD#3\uFFFD"}:START_TAG_SPAN:Text inside span${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_SPAN:
  `;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "\n  ");
        i0.ɵɵelementStart(1, "div");
        i0.ɵɵi18nStart(2, 0);
        i0.ɵɵelement(3, "span");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵtext(4, "\n");
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
    Some text
    <span>Text inside span</span>
  </div>
`,
              preserveWhitespaces: true,
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
      filePath: "preserve_inner_content.ts",
      lineNumber: 14
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
