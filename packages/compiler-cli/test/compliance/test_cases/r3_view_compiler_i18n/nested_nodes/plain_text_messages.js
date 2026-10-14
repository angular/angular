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
    decls: 10,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4890179241114413722$$PLAIN_TEXT_MESSAGES_TS_0 =
          /* @ts-ignore */
          goog.getMsg("My i18n block #1");
        i18n_0 = MSG_EXTERNAL_4890179241114413722$$PLAIN_TEXT_MESSAGES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`My i18n block #1`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2413150872298537152$$PLAIN_TEXT_MESSAGES_TS_1 =
          /* @ts-ignore */
          goog.getMsg("My i18n block #2");
        i18n_1 = MSG_EXTERNAL_2413150872298537152$$PLAIN_TEXT_MESSAGES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`My i18n block #2`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5023003143537152794$$PLAIN_TEXT_MESSAGES_TS_2 =
          /* @ts-ignore */
          goog.getMsg("My i18n block #3");
        i18n_2 = MSG_EXTERNAL_5023003143537152794$$PLAIN_TEXT_MESSAGES_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`My i18n block #3`;
      }
      return [i18n_0, i18n_1, i18n_2];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div");
        i0.ɵɵtext(3, "My non-i18n block #1");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "div");
        i0.ɵɵi18n(5, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(6, "div");
        i0.ɵɵtext(7, "My non-i18n block #2");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(8, "div");
        i0.ɵɵi18n(9, 2);
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
  <div i18n>My i18n block #1</div>
  <div>My non-i18n block #1</div>
  <div i18n>My i18n block #2</div>
  <div>My non-i18n block #2</div>
  <div i18n>My i18n block #3</div>
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
      filePath: "plain_text_messages.ts",
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
