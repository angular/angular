import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "div");
    i0.ɵɵi18nStart(2, 0);
    i0.ɵɵelement(3, "div");
    i0.ɵɵpipe(4, "uppercase");
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵi18nExp(ctx_r0.valueA)(i0.ɵɵpipeBind1(4, 2, ctx_r0.valueB));
    i0.ɵɵi18nApply(2);
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
    vars: 1,
    consts: () => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_1048067148715869345$$NESTED_TEMPLATES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            " Some other content {$interpolation} {$startTagDiv} More nested levels with bindings {$interpolation_1} {$closeTagDiv}",
            {
              "closeTagDiv": "\uFFFD/#3\uFFFD",
              "interpolation": "\uFFFD0\uFFFD",
              "interpolation_1": "\uFFFD1\uFFFD",
              "startTagDiv": "\uFFFD#3\uFFFD"
            },
            {
              original_code: {
                "closeTagDiv": "</div>",
                "interpolation": "{{ valueA }}",
                "interpolation_1": "{{ valueB | uppercase }}",
                "startTagDiv": "<div>"
              }
            }
          );
        i18n_0 = MSG_EXTERNAL_1048067148715869345$$NESTED_TEMPLATES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` Some other content ${"\uFFFD0\uFFFD"}:INTERPOLATION: ${"\uFFFD#3\uFFFD"}:START_TAG_DIV: More nested levels with bindings ${"\uFFFD1\uFFFD"}:INTERPOLATION_1: ${"\uFFFD/#3\uFFFD"}:CLOSE_TAG_DIV:`;
      }
      return [i18n_0, [4, "ngIf"]];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtext(1, " Some content ");
        i0.ɵɵtemplate(2, MyComponent_div_2_Template, 5, 4, "div", 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
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
  <div>
    Some content
    <div *ngIf="visible">
      <div i18n>
        Some other content {{ valueA }}
        <div>
          More nested levels with bindings {{ valueB | uppercase }}
        </div>
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
