import { Component, Directive, Input, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class UppercasePipe {
  transform(v) {}
  static ɵfac = function UppercasePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || UppercasePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "uppercase",
    type: UppercasePipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      UppercasePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "uppercase",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class DivDir {
  al;
  arl;
  static ɵfac = function DivDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DivDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DivDir,
    selectors: [["div"]],
    inputs: { al: [0, "aria-label", "al"], arl: [0, "aria-roledescription", "arl"] },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DivDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "div",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        al: [
          {
            type: Input,
            args: ["aria-label"]
          }
        ],
        arl: [
          {
            type: Input,
            args: ["aria-roledescription"]
          }
        ]
      }
    );
})();
export class MyComponent {
  valueA;
  valueB;
  valueC;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 5,
    vars: 8,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5526535577705876535$$INTERPOLATION_BASIC_TS_0 =
          /* @ts-ignore */
          goog.getMsg("static text");
        i18n_0 = MSG_EXTERNAL_5526535577705876535$$INTERPOLATION_BASIC_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`static text`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8977039798304050198$$INTERPOLATION_BASIC_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "intro {$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ valueA | uppercase }}" } }
          );
        i18n_1 = MSG_EXTERNAL_8977039798304050198$$INTERPOLATION_BASIC_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`:m|d:intro ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d1
         * @meaning m1
         */
        const MSG_EXTERNAL_7432761130955693041$$INTERPOLATION_BASIC_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ valueB }}" } }
          );
        i18n_2 = MSG_EXTERNAL_7432761130955693041$$INTERPOLATION_BASIC_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`:m1|d1:${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc d2
         * @meaning m2
         */
        const MSG_EXTERNAL_7566208596013750546$$INTERPOLATION_BASIC_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation} and {$interpolation_1} and again {$interpolation_2}",
            {
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "interpolation_2": "\uFFFD2\uFFFD"
            },
            {
              original_code: {
                "interpolation": "{{ valueA }}",
                "interpolation_1": "{{ valueB }}",
                "interpolation_2": "{{ valueA + valueB }}"
              }
            }
          );
        i18n_3 = MSG_EXTERNAL_7566208596013750546$$INTERPOLATION_BASIC_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize`:m2|d2:${"\uFFFD0\uFFFD"}:INTERPOLATION: and ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: and again ${"\uFFFD2\uFFFD"}:INTERPOLATION_2:`;
      }
      let i18n_4;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6639222533406278123$$INTERPOLATION_BASIC_TS_4 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ valueC }}" } }
          );
        i18n_4 = MSG_EXTERNAL_6639222533406278123$$INTERPOLATION_BASIC_TS_4;
      } else {
        /* @ts-ignore */
        i18n_4 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [
        ["title", i18n_1, "aria-label", i18n_2],
        ["title", i18n_3, "aria-roledescription", i18n_4],
        ["id", "dynamic-1", "aria-roledescription", i18n_0, 6, "title", "aria-label"],
        ["id", "dynamic-2", 6, "title", "aria-roledescription"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 2);
        i0.ɵɵpipe(1, "uppercase");
        i0.ɵɵi18nAttributes(2, 0);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, "div", 3);
        i0.ɵɵi18nAttributes(4, 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 6, ctx.valueA))(ctx.valueB);
        i0.ɵɵi18nApply(2);
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(ctx.valueA)(ctx.valueB)(ctx.valueA + ctx.valueB)(ctx.valueC);
        i0.ɵɵi18nApply(4);
      }
    },
    dependencies: [DivDir, UppercasePipe],
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
  <div id="dynamic-1"
    i18n-title="m|d" title="intro {{ valueA | uppercase }}"
    i18n-aria-label="m1|d1" aria-label="{{ valueB }}"
    i18n-aria-roledescription aria-roledescription="static text"
  ></div>
  <div id="dynamic-2"
    i18n-title="m2|d2" title="{{ valueA }} and {{ valueB }} and again {{ valueA + valueB }}"
    i18n-aria-roledescription aria-roledescription="{{ valueC }}"
  ></div>
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
      filePath: "interpolation_basic.ts",
      lineNumber: 35
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
          args: [{ declarations: [UppercasePipe, MyComponent, DivDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [UppercasePipe, MyComponent, DivDir] });
})();
