import { Component, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => ({ "duration": 500, animation: a0 });
export class ObjectComp {
  config;
  static ɵfac = function ObjectComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ObjectComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ObjectComp,
    selectors: [["object-comp"]],
    inputs: { config: "config" },
    standalone: false,
    decls: 4,
    vars: 2,
    template: function ObjectComp_Template(rf, ctx) {
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
        i0.ɵɵtextInterpolate1(" ", ctx.config["duration"], " ");
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(" ", ctx.config.animation, " ");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ObjectComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "object-comp",
              template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
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
    i0.ɵsetClassDebugInfo(ObjectComp, {
      className: "ObjectComp",
      filePath: "object_literals.ts",
      lineNumber: 11
    });
})();
export class MyApp {
  name = "slide";
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 3,
    consts: [[3, "config"]],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "object-comp", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("config", i0.ɵɵpureFunction1(1, _c0, ctx.name));
      }
    },
    dependencies: [ObjectComp],
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
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
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
      filePath: "object_literals.ts",
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
          args: [{ declarations: [ObjectComp, MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [ObjectComp, MyApp] });
})();
