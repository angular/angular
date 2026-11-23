import { Component, HostBinding, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  myStyleExp = "";
  myClassExp = "";
  myFooClassExp = true;
  myWidthExp = "100px";
  myBarClassExp = true;
  myHeightExp = "200px";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostVars: 6,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("width", ctx.myWidthExp);
        i0.ɵɵclassProp("baz", ctx.myClassExp)("foo", ctx.myFooClassExp);
      }
    },
    standalone: false,
    decls: 1,
    vars: 4,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div");
      }
      if (rf & 2) {
        i0.ɵɵstyleProp("height", ctx.myHeightExp);
        i0.ɵɵclassProp("bar", ctx.myBarClassExp);
      }
    },
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
              template: `
    <div [style.height!important]="myHeightExp"
         [class.bar!important]="myBarClassExp"></div>
  `,
              host: {
                "[style.width!important]": "myStyleExp",
                "[class.baz!important]": "myClassExp"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myFooClassExp: [
          {
            type: HostBinding,
            args: ["class.foo!important"]
          }
        ],
        myWidthExp: [
          {
            type: HostBinding,
            args: ["style.width!important"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "important.ts",
      lineNumber: 12
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
          args: [{ declarations: [MyComponent] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();
