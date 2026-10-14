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
        const MSG_EXTERNAL_5295701706185791735$$STYLES_TS_0 =
          /* @ts-ignore */
          goog.getMsg("Text #1");
        i18n_0 = MSG_EXTERNAL_5295701706185791735$$STYLES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Text #1`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4722270221386399294$$STYLES_TS_1 =
          /* @ts-ignore */
          goog.getMsg("Text #2");
        i18n_1 = MSG_EXTERNAL_4722270221386399294$$STYLES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`Text #2`;
      }
      return [i18n_0, i18n_1, [1, "myClass"], [2, "padding", "10px"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "span", 2);
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "span", 3);
        i0.ɵɵi18n(3, 1);
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
  <span i18n class="myClass">Text #1</span>
  <span i18n style="padding: 10px;">Text #2</span>
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
      filePath: "styles.ts",
      lineNumber: 11
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
