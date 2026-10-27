import { Component, forwardRef } from "@angular/core";
import * as i0 from "@angular/core";
export class TestComponent {
  static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [["test"]],
    decls: 1,
    vars: 0,
    template: function TestComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "other-standalone");
      }
    },
    dependencies: () => [StandaloneComponent],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "test",
              imports: [forwardRef(() => StandaloneComponent)],
              template: "<other-standalone></other-standalone>"
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: "TestComponent",
      filePath: "forward_ref.ts",
      lineNumber: 8
    });
})();
export class StandaloneComponent {
  static ɵfac = function StandaloneComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || StandaloneComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: StandaloneComponent,
    selectors: [["other-standalone"]],
    decls: 0,
    vars: 0,
    template: function StandaloneComponent_Template(rf, ctx) {},
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      StandaloneComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "other-standalone",
              template: ""
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
    i0.ɵsetClassDebugInfo(StandaloneComponent, {
      className: "StandaloneComponent",
      filePath: "forward_ref.ts",
      lineNumber: 15
    });
})();
