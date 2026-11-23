import { Component, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponentWithInterpolation {
  fooId = "123";
  static ɵfac = function MyComponentWithInterpolation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponentWithInterpolation)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponentWithInterpolation,
    selectors: [["my-component-with-interpolation"]],
    standalone: false,
    decls: 1,
    vars: 3,
    template: function MyComponentWithInterpolation_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵclassMap(i0.ɵɵinterpolate1("foo foo-", ctx.fooId));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponentWithInterpolation,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component-with-interpolation",
              template: `
    <div class="foo foo-{{ fooId }}"></div>
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
    i0.ɵsetClassDebugInfo(MyComponentWithInterpolation, {
      className: "MyComponentWithInterpolation",
      filePath: "binding_slots.ts",
      lineNumber: 10
    });
})();
export class MyComponentWithMuchosInterpolation {
  fooId = "123";
  fooUsername = "superfoo";
  static ɵfac = function MyComponentWithMuchosInterpolation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponentWithMuchosInterpolation)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponentWithMuchosInterpolation,
    selectors: [["my-component-with-muchos-interpolation"]],
    standalone: false,
    decls: 1,
    vars: 4,
    template: function MyComponentWithMuchosInterpolation_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵclassMap(i0.ɵɵinterpolate2("foo foo-", ctx.fooId, "-", ctx.fooUsername));
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponentWithMuchosInterpolation,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component-with-muchos-interpolation",
              template: `
    <div class="foo foo-{{ fooId }}-{{ fooUsername }}"></div>
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
    i0.ɵsetClassDebugInfo(MyComponentWithMuchosInterpolation, {
      className: "MyComponentWithMuchosInterpolation",
      filePath: "binding_slots.ts",
      lineNumber: 21
    });
})();
export class MyComponentWithoutInterpolation {
  exp = "bar";
  static ɵfac = function MyComponentWithoutInterpolation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponentWithoutInterpolation)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponentWithoutInterpolation,
    selectors: [["my-component-without-interpolation"]],
    standalone: false,
    decls: 1,
    vars: 2,
    template: function MyComponentWithoutInterpolation_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵclassMap(ctx.exp);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponentWithoutInterpolation,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component-without-interpolation",
              template: `
    <div [class]="exp"></div>
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
    i0.ɵsetClassDebugInfo(MyComponentWithoutInterpolation, {
      className: "MyComponentWithoutInterpolation",
      filePath: "binding_slots.ts",
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
          args: [
            {
              declarations: [
                MyComponentWithInterpolation,
                MyComponentWithMuchosInterpolation,
                MyComponentWithoutInterpolation
              ]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, {
      declarations: [
        MyComponentWithInterpolation,
        MyComponentWithMuchosInterpolation,
        MyComponentWithoutInterpolation
      ]
    });
})();
