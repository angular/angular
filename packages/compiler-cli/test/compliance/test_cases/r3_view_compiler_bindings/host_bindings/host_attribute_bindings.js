import { Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class HostAttributeDir {
  required = true;
  static ɵfac = function HostAttributeDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostAttributeDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostAttributeDir,
    selectors: [["", "hostAttributeDir", ""]],
    hostVars: 1,
    hostBindings: function HostAttributeDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("required", ctx.required);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostAttributeDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[hostAttributeDir]",
              host: { "[attr.required]": "required" },
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
          args: [{ declarations: [HostAttributeDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostAttributeDir] });
})();
