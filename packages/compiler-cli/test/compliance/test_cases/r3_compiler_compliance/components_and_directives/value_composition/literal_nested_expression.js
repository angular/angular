import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => ({ opacity: 0, duration: 0 });
const _c1 = a0 => ({ opacity: 1, duration: a0 });
const _c2 = (a0, a1) => [a0, a1];
const _c3 = (a0, a1) => ({ animation: a0, actions: a1 });
export class NestedComp {
  config;
  static ɵfac = function NestedComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NestedComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: NestedComp,
    selectors: [["nested-comp"]],
    inputs: { config: "config" },
    standalone: false,
    decls: 6,
    vars: 3,
    template: function NestedComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "p");
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "p");
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(4, "p");
        i0.ɵɵtext(5);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(" ", ctx.config.animation, " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", ctx.config.actions[0].opacity, " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", ctx.config.actions[1].duration, " ");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NestedComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "nested-comp",
              template: `
    <p> {{ config.animation }} </p>
    <p> {{config.actions[0].opacity }} </p>
    <p> {{config.actions[1].duration }} </p>
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        config: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(NestedComp, {
      className: "NestedComp",
      filePath: "literal_nested_expression.ts",
      lineNumber: 12
    });
})();
export class MyApp {
  name = "slide";
  duration = 100;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 10,
    consts: [[3, "config"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "nested-comp", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          "config",
          i0.ɵɵpureFunction2(
            7,
            _c3,
            ctx.name,
            i0.ɵɵpureFunction2(
              4,
              _c2,
              i0.ɵɵpureFunction0(1, _c0),
              i0.ɵɵpureFunction1(2, _c1, ctx.duration)
            )
          )
        );
      }
    },
    dependencies: [NestedComp],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-app",
              template: `
  <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
  </nested-comp>
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "literal_nested_expression.ts",
      lineNumber: 24
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
          args: [{ declarations: [NestedComp, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [NestedComp, MyApp] });
})();
