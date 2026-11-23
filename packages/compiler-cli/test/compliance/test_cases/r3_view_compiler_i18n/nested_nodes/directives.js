import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵelement(2, "span");
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵi18nExp(ctx_r0.valueA);
    i0.ɵɵi18nApply(1);
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
    decls: 1,
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_119975189388320493$$DIRECTIVES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "Some other content {$startTagSpan}{$interpolation}{$closeTagSpan}",
            {
              "closeTagSpan": "\uFFFD/#2\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "startTagSpan": "\uFFFD#2\uFFFD"
            },
            {
              original_code: {
                "closeTagSpan": "</span>",
                "interpolation": "{{ valueA }}",
                "startTagSpan": "<span>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_119975189388320493$$DIRECTIVES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Some other content ${"\uFFFD#2\uFFFD"}:START_TAG_SPAN:${"\uFFFD0\uFFFD"}:INTERPOLATION:${"\uFFFD/#2\uFFFD"}:CLOSE_TAG_SPAN:`;
      }
      return [i18n_0, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 3, 1, "div", 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.visible);
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
  <div i18n *ngIf="visible">Some other content <span>{{ valueA }}</span></div>
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
      filePath: "directives.ts",
      lineNumber: 10
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
