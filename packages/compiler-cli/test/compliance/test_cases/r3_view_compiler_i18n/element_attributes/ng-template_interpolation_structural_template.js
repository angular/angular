import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_0_ng_template_0_Template(rf, ctx) {}
function MyComponent_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtemplate(0, MyComponent_0_ng_template_0_Template, 0, 0, "ng-template", 2);
    i0.ɵɵi18nAttributes(1, 0);
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵi18nExp(ctx_r0.name);
    i0.ɵɵi18nApply(1);
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
  name = "";
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
        const MSG_EXTERNAL_3771704108176831903$$NG_TEMPLATE_INTERPOLATION_STRUCTURAL_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "Hello {$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ name }}" } }
          );
        i18n_0 = MSG_EXTERNAL_3771704108176831903$$NG_TEMPLATE_INTERPOLATION_STRUCTURAL_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [
        ["title", i18n_0],
        [4, "ngIf"],
        [3, "title"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_0_Template, 2, 1, null, 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", true);
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
  <ng-template *ngIf="true" i18n-title title="Hello {{ name }}"></ng-template>
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
      filePath: "ng-template_interpolation_structural.ts",
      lineNumber: 18
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
