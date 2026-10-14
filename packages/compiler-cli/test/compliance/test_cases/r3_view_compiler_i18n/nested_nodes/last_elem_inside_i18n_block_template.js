import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  attr;
  text;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 4,
    vars: 2,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1678983741718428223$$LAST_ELEM_INSIDE_I18N_BLOCK_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ attr }}" } }
          );
        i18n_0 = MSG_EXTERNAL_1678983741718428223$$LAST_ELEM_INSIDE_I18N_BLOCK_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3554215745691683147$$LAST_ELEM_INSIDE_I18N_BLOCK_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation}{$startHeadingLevel1}{$closeHeadingLevel1}",
            {
              "closeHeadingLevel1": "\uFFFD/#2\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "startHeadingLevel1": "\uFFFD#2\uFFFD"
            },
            {
              original_code: {
                "closeHeadingLevel1": "</h1>",
                "interpolation": "{{ text }}",
                "startHeadingLevel1": '<h1 i18n-title title="{{ attr }}">'
              }
            }
          );
        i18n_1 = MSG_EXTERNAL_3554215745691683147$$LAST_ELEM_INSIDE_I18N_BLOCK_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION:${"\uFFFD#2\uFFFD"}:START_HEADING_LEVEL1:${"\uFFFD/#2\uFFFD"}:CLOSE_HEADING_LEVEL1:`;
      }
      return [i18n_1, ["title", i18n_0], [6, "title"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementStart(2, "h1", 2);
        i0.ɵɵi18nAttributes(3, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.attr);
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.text);
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
  <div i18n>{{ text }}<h1 i18n-title title="{{ attr }}"></h1></div>
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
      filePath: "last_elem_inside_i18n_block.ts",
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
