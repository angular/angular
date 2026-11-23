import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_2_ng_template_2_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 3);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵi18nExp(ctx_r0.valueC);
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_ng_template_2_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵtemplate(
      1,
      MyComponent_ng_template_2_ng_template_2_ng_template_1_Template,
      1,
      1,
      "ng-template"
    );
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.valueB);
    i0.ɵɵi18nApply(0);
  }
}
function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵpipe(1, "uppercase");
    i0.ɵɵtemplate(2, MyComponent_ng_template_2_ng_template_2_Template, 2, 1, "ng-template");
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
  }
}
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 3,
    vars: 0,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4054819503343192023$$NESTED_TEMPLATES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagNgTemplate} Template A: {$interpolation} {$startTagNgTemplate} Template B: {$interpolation_1} {$startTagNgTemplate} Template C: {$interpolation_2} {$closeTagNgTemplate}{$closeTagNgTemplate}{$closeTagNgTemplate}",
            {
              "closeTagNgTemplate": "[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]",
              "interpolation": "\uFFFD0:1\uFFFD",
              "interpolation_1": "\uFFFD0:2\uFFFD",
              "interpolation_2": "\uFFFD0:3\uFFFD",
              "startTagNgTemplate": "[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"
            },
            {
              original_code: {
                "closeTagNgTemplate": "</ng-template>",
                "interpolation": "{{ valueA | uppercase }}",
                "interpolation_1": "{{ valueB }}",
                "interpolation_2": "{{ valueC }}",
                "startTagNgTemplate": "<ng-template>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_4054819503343192023$$NESTED_TEMPLATES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"}:START_TAG_NG_TEMPLATE: Template A: ${"\uFFFD0:1\uFFFD"}:INTERPOLATION: ${"[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"}:START_TAG_NG_TEMPLATE: Template B: ${"\uFFFD0:2\uFFFD"}:INTERPOLATION_1: ${"[\uFFFD*2:1\uFFFD|\uFFFD*2:2\uFFFD|\uFFFD*1:3\uFFFD]"}:START_TAG_NG_TEMPLATE: Template C: ${"\uFFFD0:3\uFFFD"}:INTERPOLATION_2: ${"[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:${"[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:${"[\uFFFD/*1:3\uFFFD|\uFFFD/*2:2\uFFFD|\uFFFD/*2:1\uFFFD]"}:CLOSE_TAG_NG_TEMPLATE:`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0);
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 3, 3, "ng-template");
        i0.ɵɵi18nEnd();
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
  <div i18n>
    <ng-template>
      Template A: {{ valueA | uppercase }}
      <ng-template>
        Template B: {{ valueB }}
        <ng-template>
          Template C: {{ valueC }}
        </ng-template>
      </ng-template>
    </ng-template>
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
      filePath: "nested_templates.ts",
      lineNumber: 20
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
