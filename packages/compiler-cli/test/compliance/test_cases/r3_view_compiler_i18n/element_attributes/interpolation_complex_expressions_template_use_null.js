import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  valueA;
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
        const MSG_EXTERNAL_3462388422673575127$$INTERPOLATION_COMPLEX_EXPRESSIONS_USE_NULL_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation} title",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{valueA.getRawValue()?.getTitle()}}" } }
          );
        i18n_0 = MSG_EXTERNAL_3462388422673575127$$INTERPOLATION_COMPLEX_EXPRESSIONS_USE_NULL_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION: title`;
      }
      return [
        ["title", i18n_0],
        [6, "title"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 1);
        i0.ɵɵi18nAttributes(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵi18nExp((tmp_0_0 = ctx.valueA.getRawValue()) == null ? null : tmp_0_0.getTitle());
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
  <div i18n-title title="{{valueA.getRawValue()?.getTitle()}} title"></div>
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
      filePath: "interpolation_complex_expressions_use_null.ts",
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
