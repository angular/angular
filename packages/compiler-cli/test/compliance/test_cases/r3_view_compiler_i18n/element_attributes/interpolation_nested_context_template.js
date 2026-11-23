import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div")(1, "div", 2);
    i0.ɵɵpipe(2, "uppercase");
    i0.ɵɵi18nAttributes(3, 0);
    i0.ɵɵelementEnd()();
  }
  if (rf & 2) {
    const outer_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(i0.ɵɵpipeBind1(2, 1, outer_r1));
    i0.ɵɵi18nApply(3);
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
  outer = "";
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
         * @desc d
         * @meaning m
         */
        const MSG_EXTERNAL_8538466649243975456$$INTERPOLATION_NESTED_CONTEXT_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            "different scope {$interpolation}",
            { "interpolation": "\uFFFD0\uFFFD" },
            { original_code: { "interpolation": "{{ outer | uppercase }}" } }
          );
        i18n_0 = MSG_EXTERNAL_8538466649243975456$$INTERPOLATION_NESTED_CONTEXT_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`:m|d:different scope ${"\uFFFD0\uFFFD"}:INTERPOLATION:`;
      }
      return [
        ["title", i18n_0],
        [4, "ngFor", "ngForOf"],
        [6, "title"]
      ];
    },
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtemplate(0, MyComponent_div_0_Template, 4, 3, "div", 1);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngForOf", ctx.items);
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
  <div *ngFor="let outer of items">
    <div i18n-title="m|d" title="different scope {{ outer | uppercase }}"></div>
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
      filePath: "interpolation_nested_context.ts",
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
