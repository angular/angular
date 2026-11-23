import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-comp"]],
    hostAttrs: ["class.is-compact", "false", "style.width", "0", "attr.tabindex", "5"],
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
              selector: "my-comp",
              template: "",
              host: {
                ["class.is-compact"]: "false",
                ["style.width"]: "0",
                ["attr.tabindex"]: "5"
              }
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
      filePath: "deceptive_attrs.ts",
      lineNumber: 12
    });
})();
export class MyComponent2 {
  static ɵfac = function MyComponent2_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent2)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent2,
    selectors: [["my-comp-2"]],
    hostVars: 5,
    hostBindings: function MyComponent2_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("tabindex", 5);
        i0.ɵɵstyleProp("width", 0);
        i0.ɵɵclassProp("is-compact", false);
      }
    },
    decls: 0,
    vars: 0,
    template: function MyComponent2_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent2,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-comp-2",
              template: "",
              host: {
                "[class.is-compact]": "false",
                "[style.width]": "0",
                "[attr.tabindex]": "5"
              }
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
    i0.ɵsetClassDebugInfo(MyComponent2, {
      className: "MyComponent2",
      filePath: "deceptive_attrs.ts",
      lineNumber: 24
    });
})();
