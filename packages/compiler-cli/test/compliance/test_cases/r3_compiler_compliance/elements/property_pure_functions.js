import { Component, Directive, Input, NgModule, Pipe } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = a0 => [a0];
const _c1 = () => [0];
export class DivDir {
  ternary;
  pipe;
  and;
  or;
  static ɵfac = function DivDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DivDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DivDir,
    selectors: [["div"]],
    inputs: { ternary: "ternary", pipe: "pipe", and: "and", or: "or" },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DivDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "div",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        ternary: [
          {
            type: Input
          }
        ],
        pipe: [
          {
            type: Input
          }
        ],
        and: [
          {
            type: Input
          }
        ],
        or: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class PipePipe {
  transform(v, a, a2) {}
  static ɵfac = function PipePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || PipePipe)();
  };
  static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: "pipe",
    type: PipePipe,
    pure: true,
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      PipePipe,
      [
        {
          type: Pipe,
          args: [
            {
              name: "pipe",
              standalone: false
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyComponent {
  id = "one";
  cond = "";
  value = "";
  a = "";
  b = "";
  c = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    standalone: false,
    decls: 2,
    vars: 15,
    consts: [[3, "ternary", "pipe", "and", "or"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
        i0.ɵɵpipe(1, "pipe");
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          "ternary",
          ctx.cond ? i0.ɵɵpureFunction1(8, _c0, ctx.a) : i0.ɵɵpureFunction0(10, _c1)
        )("pipe", i0.ɵɵpipeBind3(1, 4, ctx.value, 1, 2))(
          "and",
          ctx.cond && i0.ɵɵpureFunction1(11, _c0, ctx.b)
        )("or", ctx.cond || i0.ɵɵpureFunction1(13, _c0, ctx.c));
      }
    },
    dependencies: [DivDir, PipePipe],
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
              selector: "my-component",
              template: `<div
    [ternary]="cond ? [a] : [0]"
    [pipe]="value | pipe:1:2"
    [and]="cond && [b]"
    [or]="cond || [c]"
  ></div>`,
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
      filePath: "property_pure_functions.ts",
      lineNumber: 32
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
          args: [{ declarations: [MyComponent, DivDir, PipePipe] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, DivDir, PipePipe] });
})();
