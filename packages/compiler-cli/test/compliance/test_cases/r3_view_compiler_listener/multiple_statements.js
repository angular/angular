import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    hostBindings: function MyComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵlistener("click", function MyComponent_click_HostBindingHandler($event) {
          $event.preventDefault();
          return $event.target;
        });
      }
    },
    decls: 1,
    vars: 0,
    consts: [[3, "click"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div", 0);
        i0.ɵɵdomListener("click", function MyComponent_Template_div_click_0_listener($event) {
          $event.preventDefault();
          return $event.target;
        });
        i0.ɵɵdomElementEnd();
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
              host: { "(click)": "$event.preventDefault(); $event.target" },
              template: `
    <div (click)="$event.preventDefault(); $event.target"></div>
  `
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
      filePath: "multiple_statements.ts",
      lineNumber: 10
    });
})();
