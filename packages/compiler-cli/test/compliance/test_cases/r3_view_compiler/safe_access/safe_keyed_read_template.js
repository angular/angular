import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  constructor() {
    this.unknownNames = null;
    this.knownNames = [["Frodo", "Bilbo"]];
    this.species = null;
    this.keys = null;
    this.speciesMap = { key: "unknown" };
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["ng-component"]],
  standalone: false,
  decls: 2,
  vars: 5,
  consts: [[3, "title"]],
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelementStart(0, "span", 0);
      i0.ɵɵtext(1);
      i0.ɵɵelementEnd();
    }
    if (rf & 2) {
      i0.ɵɵproperty("title", "Your last name is " + (ctx.unknownNames?.[0] || "unknown"));
      i0.ɵɵadvance();
      i0.ɵɵtextInterpolate4(
        " Hello, ",
        ctx.knownNames?.[0]?.[1],
        "! You are a Balrog: ",
        ctx.species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || "unknown",
        " You are an Elf: ",
        ctx.speciesMap?.[ctx.keys?.[0] ?? "key"],
        " You are an Orc: ",
        ctx.speciesMap?.["key"],
        " "
      );
    }
  },
  encapsulation: 2
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    <span [title]="'Your last name is ' + (unknownNames?.[0] || 'unknown')">
      Hello, {{ knownNames?.[0]?.[1] }}!
      You are a Balrog: {{ species?.[0]?.[1]?.[2]?.[3]?.[4]?.[5] || 'unknown' }}
      You are an Elf: {{ speciesMap?.[keys?.[0] ?? 'key'] }}
      You are an Orc: {{ speciesMap?.['key'] }}
    </span>
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
      filePath: "safe_keyed_read.ts",
      lineNumber: 14
    });
})();
export class MyModule {}
MyModule.ɵfac = function MyModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyModule)();
};
MyModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
MyModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [MyApp] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] });
})();
