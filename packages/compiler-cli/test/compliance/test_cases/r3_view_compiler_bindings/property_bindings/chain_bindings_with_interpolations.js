import { Component, Directive, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class ButtonDir {
  label;
  static ɵfac = function ButtonDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ButtonDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: ButtonDir,
    selectors: [["button"]],
    inputs: { label: "label" },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ButtonDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "button",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        label: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 7,
    consts: [[3, "title", "id", "tabindex", "label"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "button", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("tabindex", i0.ɵɵinterpolate(0 + 3))(
          "label",
          i0.ɵɵinterpolate2("hello-", 1 + 3, "-", 2 + 3)
        )("title", 1)("id", 2);
      }
    },
    dependencies: [ButtonDir],
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
              template:
                '<button [title]="1" [id]="2" tabindex="{{0 + 3}}" label="hello-{{1 + 3}}-{{2 + 3}}"></button>',
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
      filePath: "chain_bindings_with_interpolations.ts",
      lineNumber: 16
    });
})();
export class MyMod {
  static ɵfac = function MyMod_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyMod)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyMod,
      [
        {
          type: NgModule,
          args: [{ declarations: [ButtonDir, MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [ButtonDir, MyComponent] });
})();
