import { Component, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => ({});
export class HostBindingComp {
  static ɵfac = function HostBindingComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: HostBindingComp,
    selectors: [["host-binding-comp"]],
    standalone: false,
    decls: 3,
    vars: 4,
    template: function HostBindingComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵpipe(1, "my_forward_pipe");
        i0.ɵɵtext(2, "...");
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵattribute(
          "style",
          i0.ɵɵpipeBind1(1, 1, i0.ɵɵpureFunction0(3, _c0)),
          i0.ɵɵsanitizeStyle
        );
      }
    },
    dependencies: () => [MyForwardPipe],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "host-binding-comp",
              template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
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
    i0.ɵsetClassDebugInfo(HostBindingComp, {
      className: "HostBindingComp",
      filePath: "forward_referenced_pipe.ts",
      lineNumber: 10
    });
})();
class MyForwardPipe {
  transform(param) {}
  static ɵfac = function MyForwardPipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyForwardPipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "my_forward_pipe",
    type: MyForwardPipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyForwardPipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "my_forward_pipe",
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
          args: [{ declarations: [HostBindingComp, MyForwardPipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [HostBindingComp, MyForwardPipe] });
})();
