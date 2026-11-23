import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  doSomething() {}
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 3,
    vars: 0,
    consts: [[3, "animateABC"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div")(1, "p", 0);
        i0.ɵɵdomListener("animateABC", function MyComponent_Template_p_animateABC_1_listener() {
          return ctx.doSomething();
        });
        i0.ɵɵtext(2, "Fading Content");
        i0.ɵɵdomElementEnd()();
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
    <div>
      <p (animateABC)="doSomething()">Fading Content</p>
    </div>
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
      filePath: "animate_prefix_with_event_listener.ts",
      lineNumber: 11
    });
})();
