import { Component, HostBinding, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  myStyle = { width: "100px" };
  myClass = { bar: false };
  id = "some id";
  title = "some title";
  name = "";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostAttrs: ["title", "foo title", 1, "foo", "baz", 2, "width", "200px", "height", "500px"],
    hostVars: 6,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("id", ctx.id)("title", ctx.title);
        i0.ɵɵstyleMap(ctx.myStyle);
        i0.ɵɵclassMap(ctx.myClass);
      }
    },
    inputs: { name: "name" },
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
              host: {
                "style": "width:200px; height:500px",
                "class": "foo baz",
                "title": "foo title"
              },
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
        id: [
          {
            type: HostBinding,
            args: ["id"]
          }
        ],
        title: [
          {
            type: HostBinding,
            args: ["title"]
          }
        ],
        name: [
          {
            type: Input,
            args: ["name"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "component_host_binding_slots.ts",
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
