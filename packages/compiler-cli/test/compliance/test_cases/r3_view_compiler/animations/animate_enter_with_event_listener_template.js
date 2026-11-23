import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  slideFn(event) {
    event.target.classList.add("slide-in");
  }
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 3,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "div")(1, "p");
        i0.ɵɵanimateEnterListener(function MyComponent_Template_p_animateenter_1_listener($event) {
          return ctx.slideFn($event);
        });
        i0.ɵɵtext(2, "Sliding Content");
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
      <p (animate.enter)="slideFn($event)">Sliding Content</p>
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
      filePath: "animate_enter_with_event_listener.ts",
      lineNumber: 11
    });
})();
