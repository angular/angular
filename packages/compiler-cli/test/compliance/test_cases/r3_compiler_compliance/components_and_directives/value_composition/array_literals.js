import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => ["Nancy", a0];
export class MyComp {
  names;
  static ɵfac = function MyComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [["my-comp"]],
    inputs: { names: "names" },
    standalone: false,
    decls: 4,
    vars: 2,
    template: function MyComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "p");
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, "p");
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate(ctx.names[0]);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(ctx.names[1]);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-comp",
              template: `
    <p>{{ names[0] }}</p>
    <p>{{ names[1] }}</p>
  `,
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        names: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComp, {
      className: "MyComp",
      filePath: "array_literals.ts",
      lineNumber: 11
    });
})();
export class MyApp {
  customName = "Bess";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 3,
    consts: [[3, "names"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "my-comp", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("names", i0.ɵɵpureFunction1(1, _c0, ctx.customName));
      }
    },
    dependencies: [MyComp],
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
  <my-comp [names]="['Nancy', customName]"></my-comp>
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
      filePath: "array_literals.ts",
      lineNumber: 22
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
          args: [{ declarations: [MyComp, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComp, MyApp] });
})();
