import { Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class SomeDirective {
  static ɵfac = function SomeDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: SomeDirective,
    selectors: [["", "some-directive", ""]],
    exportAs: ["someDir", "otherDir"],
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[some-directive]",
              exportAs: "someDir, otherDir",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
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
          args: [{ declarations: [SomeDirective] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [SomeDirective] });
})();
