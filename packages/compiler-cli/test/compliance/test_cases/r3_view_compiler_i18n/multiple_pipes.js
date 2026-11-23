import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  valueA = 0;
  valueB = 0;
  valueC = 0;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 11,
    vars: 15,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_3087172561491410158$$MULTIPLE_PIPES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$interpolation} and {$interpolation_1}",
            { "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD" },
            {
              original_code: {
                "interpolation": "{{ valueA | pipeA }}",
                "interpolation_1": "{{ valueB | pipeB }}"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_3087172561491410158$$MULTIPLE_PIPES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD0\uFFFD"}:INTERPOLATION: and ${"\uFFFD1\uFFFD"}:INTERPOLATION_1:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1641175607905636072$$MULTIPLE_PIPES_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagSpan}{$interpolation}{$closeTagSpan} and {$interpolation_1} {$startTagSpan}and {$interpolation_2}{$closeTagSpan}",
            {
              "closeTagSpan": "[\uFFFD/#6\uFFFD|\uFFFD/#9\uFFFD]",
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "interpolation_2": "\uFFFD2\uFFFD",
              "startTagSpan": "[\uFFFD#6\uFFFD|\uFFFD#9\uFFFD]"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "interpolation": "{{ valueA | pipeA }}",
                "interpolation_1": "{{ valueB | pipeB }}",
                "interpolation_2": "{{ valueC | pipeC }}",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_1 = MSG_EXTERNAL_1641175607905636072$$MULTIPLE_PIPES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`${"[\uFFFD#6\uFFFD|\uFFFD#9\uFFFD]"}:START_TAG_SPAN:${"\uFFFD0\uFFFD"}:INTERPOLATION:${"[\uFFFD/#6\uFFFD|\uFFFD/#9\uFFFD]"}:CLOSE_TAG_SPAN: and ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"[\uFFFD#6\uFFFD|\uFFFD#9\uFFFD]"}:START_TAG_SPAN:and ${"\uFFFD2\uFFFD"}:INTERPOLATION_2:${"[\uFFFD/#6\uFFFD|\uFFFD/#9\uFFFD]"}:CLOSE_TAG_SPAN:`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1);
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18n(1, 0);
        i0.ɵɵpipe(2, "pipeA");
        i0.ɵɵpipe(3, "pipeB");
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "div");
        i0.ɵɵi18nStart(5, 1);
        i0.ɵɵelement(6, "span");
        i0.ɵɵpipe(7, "pipeA");
        i0.ɵɵpipe(8, "pipeB");
        i0.ɵɵelement(9, "span");
        i0.ɵɵpipe(10, "pipeC");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 5, ctx.valueA))(i0.ɵɵpipeBind1(3, 7, ctx.valueB));
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(7);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(7, 9, ctx.valueA))(i0.ɵɵpipeBind1(8, 11, ctx.valueB))(
          i0.ɵɵpipeBind1(10, 13, ctx.valueC)
        );
        i0.ɵɵi18nApply(5);
      }
    },
    dependencies: () => [PipeA, PipeB, PipeC],
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
  <div i18n>{{ valueA | pipeA }} and {{ valueB | pipeB }}</div>
  <div i18n><span>{{ valueA | pipeA }}</span> and {{ valueB | pipeB }} <span>and {{ valueC | pipeC }}</span></div>
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
      filePath: "multiple_pipes.ts",
      lineNumber: 11
    });
})();
export class PipeA {
  transform() {
    return null;
  }
  static ɵfac = function PipeA_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PipeA)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "pipeA",
    type: PipeA,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      PipeA,
      [
        {
          type: Pipe,
          args: [
            {
              name: "pipeA",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class PipeB {
  transform() {
    return null;
  }
  static ɵfac = function PipeB_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PipeB)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "pipeB",
    type: PipeB,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      PipeB,
      [
        {
          type: Pipe,
          args: [
            {
              name: "pipeB",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class PipeC {
  transform() {
    return null;
  }
  static ɵfac = function PipeC_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PipeC)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "pipeC",
    type: PipeC,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      PipeC,
      [
        {
          type: Pipe,
          args: [
            {
              name: "pipeC",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
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
          args: [{ declarations: [MyComponent, PipeA, PipeB, PipeC] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, PipeA, PipeB, PipeC] });
})();
