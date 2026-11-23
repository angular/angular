import { Component, HostBinding, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  myStyle = { width: "100px" };
  myClass = { bar: false };
  myColorProp = "red";
  myFooClass = "red";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostAttrs: [1, "foo", "baz", 2, "width", "200px", "height", "500px"],
    hostVars: 8,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleMap(ctx.myStyle);
        i0.ɵɵclassMap(ctx.myClass);
        i0.ɵɵstyleProp("color", ctx.myColorProp);
        i0.ɵɵclassProp("foo", ctx.myFooClass);
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
              host: { "style": "width:200px; height:500px", "class": "foo baz" },
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
        myClass: [
          {
            type: HostBinding,
            args: ["class"]
          }
        ],
        myColorProp: [
          {
            type: HostBinding,
            args: ["style.color"]
          }
        ],
        myFooClass: [
          {
            type: HostBinding,
            args: ["class.foo"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "static_and_dynamic.ts",
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
