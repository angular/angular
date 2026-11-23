import { Directive, HostBinding, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingDir {
  true;
  false;
  other;
  static ɵfac = function HostBindingDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingDir,
    selectors: [["", "hostBindingDir", ""]],
    hostVars: 10,
    hostBindings: function HostBindingDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵclassProp("a", true)("b", false)("c", ctx.true)("d", ctx.false)("e", ctx.other);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[hostBindingDir]",
              host: {
                "[class.a]": "true",
                "[class.b]": "false"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        true: [
          {
            type: HostBinding,
            args: ["class.c"]
          }
        ],
        false: [
          {
            type: HostBinding,
            args: ["class.d"]
          }
        ],
        other: [
          {
            type: HostBinding,
            args: ["class.e"]
          }
        ]
      }
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
          args: [{ declarations: [HostBindingDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingDir] });
})();
