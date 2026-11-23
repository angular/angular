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
    decls: 4,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5421724224363734696$$NG_CONTAINER_WITH_NON_TEXT_CONTENT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Hello {$startTagNgContainer}there {$startTagStrong}!{$closeTagStrong}{$closeTagNgContainer}",
            {
              "closeTagNgContainer": "\uFFFD/#2\uFFFD",
              "closeTagStrong": "\uFFFD/#3\uFFFD",
              "startTagNgContainer": "\uFFFD#2\uFFFD",
              "startTagStrong": "\uFFFD#3\uFFFD"
            },
            {
              original_code: {
                "closeTagNgContainer": "</ng-container>",
                "closeTagStrong": "</strong>",
                "startTagNgContainer": "<ng-container>",
                "startTagStrong": "<strong>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_5421724224363734696$$NG_CONTAINER_WITH_NON_TEXT_CONTENT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Hello ${"\uFFFD#2\uFFFD"}:START_TAG_NG_CONTAINER:there ${"\uFFFD#3\uFFFD"}:START_TAG_STRONG:!${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_STRONG:${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_NG_CONTAINER:`;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementContainerStart(2);
        i0.ɵɵelement(3, "strong");
        i0.ɵɵelementContainerEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
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
    Hello <ng-container>there <strong>!</strong></ng-container>
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
      filePath: "ng-container_with_non_text_content.ts",
      lineNumber: 12
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
