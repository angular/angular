import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class ChildComponent {
  static ɵfac = function ChildComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ChildComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ChildComponent,
    selectors: [["child-component"]],
    hostBindings: function ChildComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵanimateLeave("fade");
      }
    },
    decls: 2,
    vars: 0,
    template: function ChildComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "p");
        i0.ɵɵtext(1, "Fading Content");
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ChildComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "child-component",
              template: `<p>Fading Content</p>`,
              host: { "animate.leave": "fade" }
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
    i0.ɵsetClassDebugInfo(ChildComponent, {
      className: "ChildComponent",
      filePath: "animate_leave_with_string_host_bindings.ts",
      lineNumber: 8
    });
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 1,
    vars: 0,
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "child-component");
        i0.ɵɵanimateLeave("slide");
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [ChildComponent],
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
              imports: [ChildComponent],
              template: `
      <child-component animate.leave="slide"></child-component>
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
      filePath: "animate_leave_with_string_host_bindings.ts",
      lineNumber: 18
    });
})();
