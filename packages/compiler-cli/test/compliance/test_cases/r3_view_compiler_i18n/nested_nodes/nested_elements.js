import { Component, NgModule, Pipe } from "@angular/core";
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
export class MyComponent {
  one = 1;
  two = 2;
  nestedInBlockTwo = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 9,
    vars: 5,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_882337278752123074$$NESTED_ELEMENTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " My i18n block #{$interpolation} {$startTagSpan}Plain text in nested element{$closeTagSpan}",
            {
              "closeTagSpan": "\uFFFD/#2\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "interpolation": "{{ one }}",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_882337278752123074$$NESTED_ELEMENTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#2\uFFFD"}:START_TAG_SPAN:Plain text in nested element${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_SPAN:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_725745709163573690$$NESTED_ELEMENTS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            " My i18n block #{$interpolation} {$startTagDiv}{$startTagDiv}{$startTagSpan} More bindings in more nested element: {$interpolation_1} {$closeTagSpan}{$closeTagDiv}{$closeTagDiv}",
            {
              "closeTagDiv": "[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]",
              "closeTagSpan": "\uFFFD/#8\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "startTagDiv": "[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]",
              "startTagSpan": "\uFFFD#8\uFFFD"
            },
            {
              original_code: {
                "closeTagDiv": "</div>",
                "closeTagSpan": "</span>",
                "interpolation": "{{ two | uppercase }}",
                "interpolation_1": "{{ nestedInBlockTwo }}",
                "startTagDiv": "<div>",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_1 = MSG_EXTERNAL_725745709163573690$$NESTED_ELEMENTS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize` My i18n block #${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]"}:START_TAG_DIV:${"[\uFFFD#6\uFFFD|\uFFFD#7\uFFFD]"}:START_TAG_DIV:${"\uFFFD#8\uFFFD"}:START_TAG_SPAN: More bindings in more nested element: ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD/#8\uFFFD"}:CLOSE_TAG_SPAN:${"[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"}:CLOSE_TAG_DIV:${"[\uFFFD/#7\uFFFD|\uFFFD/#6\uFFFD]"}:CLOSE_TAG_DIV:`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1);
      return [i18n_0, i18n_1];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, "span");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, "div");
        i0.ɵɵi18nStart(4, 1);
        i0.ɵɵpipe(5, "uppercase");
        i0.ɵɵelementStart(6, "div")(7, "div");
        i0.ɵɵelement(8, "span");
        i0.ɵɵelementEnd()();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.one);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(6);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(5, 3, ctx.two))(ctx.nestedInBlockTwo);
        i0.ɵɵi18nApply(4);
      }
    },
    dependencies: [UppercasePipe],
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
    My i18n block #{{ one }}
    <span>Plain text in nested element</span>
  </div>
  <div i18n>
    My i18n block #{{ two | uppercase }}
    <div>
      <div>
        <span>
          More bindings in more nested element: {{ nestedInBlockTwo }}
        </span>
      </div>
    </div>
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
      filePath: "nested_elements.ts",
      lineNumber: 31
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
          args: [{ declarations: [MyComponent, UppercasePipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, UppercasePipe] });
})();
