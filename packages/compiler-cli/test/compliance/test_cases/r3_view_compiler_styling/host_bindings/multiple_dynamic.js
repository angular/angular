import { Component, HostBinding, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  myHeightProp = 20;
  myBarClass = true;
  myStyle = {};
  myWidthProp = "500px";
  myFooClass = true;
  myClasses = { a: true, b: true };
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostVars: 12,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.myStyle);
        i0.ɵɵclassMap(ctx.myClasses);
        i0.ɵɵstyleProp("height", ctx.myHeightProp, "pt")("width", ctx.myWidthProp);
        i0.ɵɵclassProp("bar", ctx.myBarClass)("foo", ctx.myFooClass);
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {},
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
              template: "",
              host: { "[style.height.pt]": "myHeightProp", "[class.bar]": "myBarClass" },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        myStyle: [
          {
            type: HostBinding,
            args: ["style"]
          }
        ],
        myWidthProp: [
          {
            type: HostBinding,
            args: ["style.width"]
          }
        ],
        myFooClass: [
          {
            type: HostBinding,
            args: ["class.foo"]
          }
        ],
        myClasses: [
          {
            type: HostBinding,
            args: ["class"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "multiple_dynamic.ts",
      lineNumber: 9
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
