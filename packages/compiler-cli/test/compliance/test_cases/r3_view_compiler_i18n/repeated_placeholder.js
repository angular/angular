import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  placeholder;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 4,
    vars: 4,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5630555247629532920$$REPEATED_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "Hello, {$interpolation}! You are a very good {$interpolation}.",
            { "interpolation": "[\uFFFD0\uFFFD|\uFFFD1\uFFFD]" },
            { original_code: { "interpolation": "{{ placeholder }}" } }
          );
        i18n_0 = MSG_EXTERNAL_5630555247629532920$$REPEATED_PLACEHOLDER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello, ${"[\uFFFD0\uFFFD|\uFFFD1\uFFFD]"}:INTERPOLATION:! You are a very good ${"[\uFFFD0\uFFFD|\uFFFD1\uFFFD]"}:INTERPOLATION:.`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_8920820792479556534$$REPEATED_PLACEHOLDER_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "Hello, {$ph}! Hello again {$ph}.",
            { "ph": "[\uFFFD0\uFFFD|\uFFFD1\uFFFD]" },
            { original_code: { "ph": '{{ placeholder // i18n(ph = "ph") }}' } }
          );
        i18n_1 = MSG_EXTERNAL_8920820792479556534$$REPEATED_PLACEHOLDER_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`Hello, ${"[\uFFFD0\uFFFD|\uFFFD1\uFFFD]"}:PH:! Hello again ${"[\uFFFD0\uFFFD|\uFFFD1\uFFFD]"}:PH:.`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1);
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "div");
        i0.ɵɵi18n(3, 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.placeholder)(ctx.placeholder);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.placeholder)(ctx.placeholder);
        i0.ɵɵi18nApply(3);
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
    <div i18n>Hello, {{ placeholder }}! You are a very good {{ placeholder }}.</div>
    <div i18n>Hello, {{ placeholder // i18n(ph = "ph") }}! Hello again {{ placeholder // i18n(ph = "ph") }}.</div>
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
      filePath: "repeated_placeholder.ts",
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
