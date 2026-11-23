import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
class MyAnimDir {
  onStart() {}
  onDone() {}
  myAnimState = "123";
  static ɵfac = function MyAnimDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyAnimDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyAnimDir,
    selectors: [["", "my-anim-dir", ""]],
    hostVars: 1,
    hostBindings: function MyAnimDir_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵsyntheticHostListener(
          "@myAnim.start",
          function MyAnimDir_animation_myAnim_start_HostBindingHandler() {
            return ctx.onStart();
          }
        )("@myAnim.done", function MyAnimDir_animation_myAnim_done_HostBindingHandler() {
          return ctx.onDone();
        });
      }
      if (rf & 2) {
        i0.ɵɵsyntheticHostProperty("@myAnim", ctx.myAnimState);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyAnimDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[my-anim-dir]",
              host: {
                "[@myAnim]": "myAnimState",
                "(@myAnim.start)": "onStart()",
                "(@myAnim.done)": "onDone()"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-cmp"]],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [["my-anim-dir", ""]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
      }
    },
    dependencies: [MyAnimDir],
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
              selector: "my-cmp",
              template: `
    <div my-anim-dir></div>
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
      filePath: "animation_host_bindings.ts",
      lineNumber: 21
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
          args: [{ declarations: [MyComponent, MyAnimDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, MyAnimDir] });
})();
