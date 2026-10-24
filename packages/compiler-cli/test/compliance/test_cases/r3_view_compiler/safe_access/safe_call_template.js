import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyApp {
  constructor() {
    this.person = { getName: () => "Bilbo" };
  }
}
MyApp.ɵfac = function MyApp_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || MyApp)();
};
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  type: MyApp,
  selectors: [["ng-component"]],
  standalone: false,
  decls: 4,
  vars: 6,
  consts: [[3, "title"]],
  template: function MyApp_Template(rf, ctx) {
    if (rf & 1) {
      i0.ɵɵelementStart(0, "span", 0);
      i0.ɵɵtext(1);
      i0.ɵɵelementEnd();
      i0.ɵɵelementStart(2, "span", 0);
      i0.ɵɵtext(3);
      i0.ɵɵelementEnd();
    }
    if (rf & 2) {
      let tmp_3_0;
      i0.ɵɵproperty("title", "Your last name is " + (ctx.person.getLastName?.() ?? "unknown"));
      i0.ɵɵadvance();
      i0.ɵɵtextInterpolate2(
        " Hello, ",
        ctx.person.getName?.(),
        "! You are a Balrog: ",
        ctx.person.getSpecies?.()?.()?.()?.()?.() || "unknown",
        " "
      );
      i0.ɵɵadvance();
      i0.ɵɵproperty(
        "title",
        "Your last name is " +
          ((ctx.person.getLastName == null ? null : ctx.person.getLastName()) ?? "unknown")
      );
      i0.ɵɵadvance();
      i0.ɵɵtextInterpolate2(
        " Hello, ",
        ctx.person.getName == null ? null : ctx.person.getName(),
        "! You are a Balrog: ",
        (ctx.person.getSpecies == null
          ? null
          : (tmp_3_0 = ctx.person.getSpecies()) == null
            ? null
            : (tmp_3_0 = tmp_3_0()) == null
              ? null
              : (tmp_3_0 = tmp_3_0()) == null
                ? null
                : (tmp_3_0 = tmp_3_0()) == null
                  ? null
                  : tmp_3_0()) || "unknown",
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
    <span [title]="'Your last name is ' + (person.getLastName?.() ?? 'unknown')">
      Hello, {{ person.getName?.() }}!
      You are a Balrog: {{ person.getSpecies?.()?.()?.()?.()?.() || 'unknown' }}
    </span>

    <!-- using the magic $safeNavigationMigration keyword --> 
    <span [title]="'Your last name is ' + ($safeNavigationMigration(person.getLastName?.()) ?? 'unknown')">
      Hello, {{ $safeNavigationMigration(person.getName?.()) }}!
      You are a Balrog: {{ $safeNavigationMigration(person.getSpecies?.()?.()?.()?.()?.()) || 'unknown' }}
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
    i0.ɵsetClassDebugInfo(MyApp, { className: "MyApp", filePath: "safe_call.ts", lineNumber: 18 });
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
