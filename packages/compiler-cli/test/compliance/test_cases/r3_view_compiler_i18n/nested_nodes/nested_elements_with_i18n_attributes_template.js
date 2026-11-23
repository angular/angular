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
  valueA;
  valueB;
  valueC;
  valueD;
  valueE;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 9,
    vars: 7,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4782264005467235841$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "Span title {$interpolation} and {$interpolation_1}",
            { "interpolation": "\uFFFD0\uFFFD", "interpolation_1": "\uFFFD1\uFFFD" },
            {
              original_code: { "interpolation": "{{ valueB }}", "interpolation_1": "{{ valueC }}" }
            }
          );
        i18n_0 = MSG_EXTERNAL_4782264005467235841$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Span title ${"\uFFFD0\uFFFD"}:INTERPOLATION: and ${"\uFFFD1\uFFFD"}:INTERPOLATION_1:`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2719594642740200058$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            "Span title {$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ valueE }}" } }
          );
        i18n_1 = MSG_EXTERNAL_2719594642740200058$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`Span title ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      let i18n_2;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_789713089942130201$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            " My i18n block #1 with value: {$interpolation} {$startTagSpan} Plain text in nested element (block #1) {$closeTagSpan}",
            {
              "closeTagSpan": "\uFFFD/#2\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "interpolation": "{{ valueA }}",
                "startTagSpan": '<span i18n-title title="Span title {{ valueB }} and {{ valueC }}">'
              }
            }
          );
        i18n_2 = MSG_EXTERNAL_789713089942130201$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` My i18n block #1 with value: ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#2\uFFFD"}:START_TAG_SPAN: Plain text in nested element (block #1) ${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_SPAN:`;
      }
      let i18n_3;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6932146024895341161$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            " My i18n block #2 with value {$interpolation} {$startTagSpan} Plain text in nested element (block #2) {$closeTagSpan}",
            {
              "closeTagSpan": "\uFFFD/#7\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#7\uFFFD"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "interpolation": "{{ valueD | uppercase }}",
                "startTagSpan": '<span i18n-title title="Span title {{ valueE }}">'
              }
            }
          );
        i18n_3 = MSG_EXTERNAL_6932146024895341161$$NESTED_ELEMENTS_WITH_I18N_ATTRIBUTES_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize` My i18n block #2 with value ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#7\uFFFD"}:START_TAG_SPAN: Plain text in nested element (block #2) ${"\uFFFD/#7\uFFFD"}:CLOSE_TAG_SPAN:`;
      }
      return [i18n_2, i18n_3, ["title", i18n_0], ["title", i18n_1], [6, "title"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelementStart(2, "span", 4);
        i0.ɵɵi18nAttributes(3, 2);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "div");
        i0.ɵɵi18nStart(5, 1);
        i0.ɵɵpipe(6, "uppercase");
        i0.ɵɵelementStart(7, "span", 4);
        i0.ɵɵi18nAttributes(8, 3);
        i0.ɵɵelementEnd();
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.valueB)(ctx.valueC);
        i0.ɵɵi18nApply(3);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.valueA);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(ctx.valueE);
        i0.ɵɵi18nApply(8);
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(6, 5, ctx.valueD));
        i0.ɵɵi18nApply(5);
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
  My i18n block #1 with value: {{ valueA }}
  <span i18n-title title="Span title {{ valueB }} and {{ valueC }}">
    Plain text in nested element (block #1)
  </span>
</div>
<div i18n>
  My i18n block #2 with value {{ valueD | uppercase }}
  <span i18n-title title="Span title {{ valueE }}">
    Plain text in nested element (block #2)
  </span>
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
      filePath: "nested_elements_with_i18n_attributes.ts",
      lineNumber: 29
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
          args: [{ declarations: [UppercasePipe, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [UppercasePipe, MyComponent] });
})();
