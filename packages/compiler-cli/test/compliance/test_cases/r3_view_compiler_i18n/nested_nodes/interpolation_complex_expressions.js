import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class AsyncPipe {
  transform(v) {}
  static ɵfac = function AsyncPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AsyncPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "async",
    type: AsyncPipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AsyncPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "async",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyComponent {
  valueA;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 3,
    vars: 5,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6886266366118454233$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " {$interpolation} {$interpolation_1} {$interpolation_2} ",
            {
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "interpolation_2": "\uFFFD2\uFFFD"
            },
            {
              original_code: {
                "interpolation": "{{ valueA | async }}",
                "interpolation_1": "{{ valueA?.a?.b }}",
                "interpolation_2": "{{ valueA.getRawValue()?.getTitle() }}"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_6886266366118454233$$INTERPOLATION_COMPLEX_EXPRESSIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD2\uFFFD"}:INTERPOLATION_2: `;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵpipe(2, "async");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 3, ctx.valueA))(ctx.valueA?.a?.b)(
          ctx.valueA.getRawValue()?.getTitle()
        );
        i0.ɵɵi18nApply(1);
      }
    },
    dependencies: [AsyncPipe],
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
    {{ valueA | async }}
    {{ valueA?.a?.b }}
    {{ valueA.getRawValue()?.getTitle() }}
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
      filePath: "interpolation_complex_expressions.ts",
      lineNumber: 22
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
          args: [{ declarations: [MyComponent, AsyncPipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, AsyncPipe] });
})();
