import { Component, Directive, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = (a0, a1) => ({ param1: a0, param2: a1 });
const _c1 = (a0, a1) => ({ value: a0, params: a1 });
export class MyDir {
  title = "";
  foo = true;
  _animValue = null;
  _animParam1 = null;
  _animParam2 = null;
  static ɵfac = function MyDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    selectors: [["", "my-dir", ""]],
    hostVars: 10,
    hostBindings: function MyDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("title", ctx.title);
        i0.ɵɵsyntheticHostProperty(
          "@anim",
          i0.ɵɵpureFunction2(
            7,
            _c1,
            ctx._animValue,
            i0.ɵɵpureFunction2(4, _c0, ctx._animParam1, ctx._animParam2)
          )
        );
        i0.ɵɵclassProp("foo", ctx.foo);
      }
    },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[my-dir]",
              host: {
                "[title]": "title",
                "[class.foo]": "foo",
                "[@anim]": `{
      value: _animValue,
      params: {
        param1: _animParam1,
        param2: _animParam2
      }
    }`
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
export class MyAppComp {
  static ɵfac = function MyAppComp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyAppComp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyAppComp,
    selectors: [["my-app"]],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [["my-dir", ""]],
    template: function MyAppComp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
      }
    },
    dependencies: [MyDir],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyAppComp,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-app",
              template: `
    <div my-dir></div>
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
    i0.ɵsetClassDebugInfo(MyAppComp, {
      className: "MyAppComp",
      filePath: "host_binding_slots.ts",
      lineNumber: 33
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
          args: [{ declarations: [MyAppComp, MyDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyAppComp, MyDir] });
})();
