import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 1);
    i0.ɵɵpipe(1, "uppercase");
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(1, 1, ctx_r0.valueA));
    i0.ɵɵi18nApply(0);
  }
}
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
  valueA = "";
  valueB = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 5,
    vars: 3,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_321671710121172402$$CHILD_ELEMENTS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "{$startTagNgTemplate}Template content: {$interpolation}{$closeTagNgTemplate}{$startTagNgContainer}Container content: {$interpolation_1}{$closeTagNgContainer}",
            {
              "closeTagNgContainer": "\uFFFD/#3\uFFFD",
              "closeTagNgTemplate": "\uFFFD/*2:1\uFFFD",
              "interpolation": "\uFFFD0:1\uFFFD",
              "interpolation_1": "\uFFFD0\uFFFD",
              "startTagNgContainer": "\uFFFD#3\uFFFD",
              "startTagNgTemplate": "\uFFFD*2:1\uFFFD"
            },
            {
              original_code: {
                "closeTagNgContainer": "</ng-container>",
                "closeTagNgTemplate": "</ng-template>",
                "interpolation": "{{ valueA | uppercase }}",
                "interpolation_1": "{{ valueB | uppercase }}",
                "startTagNgContainer": "<ng-container>",
                "startTagNgTemplate": "<ng-template>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_321671710121172402$$CHILD_ELEMENTS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`${"\uFFFD*2:1\uFFFD"}:START_TAG_NG_TEMPLATE:Template content: ${"\uFFFD0:1\uFFFD"}:INTERPOLATION:${"\uFFFD/*2:1\uFFFD"}:CLOSE_TAG_NG_TEMPLATE:${"\uFFFD#3\uFFFD"}:START_TAG_NG_CONTAINER:Container content: ${"\uFFFD0\uFFFD"}:INTERPOLATION_1:${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_NG_CONTAINER:`;
      }
      return [i18n_0];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_ng_template_2_Template, 2, 3, "ng-template");
        i0.ɵɵelementContainer(3);
        i0.ɵɵpipe(4, "uppercase");
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(4);
        i0.ɵɵi18nExp(i0.ɵɵpipeBind1(4, 1, ctx.valueB));
        i0.ɵɵi18nApply(1);
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
    <ng-template>Template content: {{ valueA | uppercase }}</ng-template>
    <ng-container>Container content: {{ valueB | uppercase }}</ng-container>
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
      filePath: "child_elements.ts",
      lineNumber: 21
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
