import { Component, HostBinding } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  color = "red";
  transition = "all 1337ms ease";
  yesToApple = true;
  yesToTomato = false;
  border = "1px solid purple";
  yesToOrange = true;
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["ng-component"]],
    hostVars: 12,
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵstyleProp("color", ctx.color)("transition", ctx.transition)("border", ctx.border);
        i0.ɵɵclassProp("apple", ctx.yesToApple)("tomato", ctx.yesToTomato)(
          "orange",
          ctx.yesToOrange
        );
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
              template: "",
              host: {
                "[class.apple]": "yesToApple",
                "[style.color]": "color",
                "[class.tomato]": "yesToTomato",
                "[style.transition]": "transition"
              },
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        border: [
          {
            type: HostBinding,
            args: ["style.border"]
          }
        ],
        yesToOrange: [
          {
            type: HostBinding,
            args: ["class.orange"]
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "host_bindings.ts",
      lineNumber: 13
    });
})();
