import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function TestComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " First ");
  }
}
function TestComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Second ");
  }
}
function TestComponent_Conditional_0_Template1(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " First ");
  }
}
function TestComponent_Conditional_1_Template1(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Second ");
  }
}
function it(_desc, fn) {}
it("case 1", () => {
  class TestComponent {
    static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || TestComponent)();
    };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [["ng-component"]],
      standalone: false,
      decls: 2,
      vars: 1,
      template: function TestComponent_Template(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵconditionalCreate(0, TestComponent_Conditional_0_Template, 1, 0)(
            1,
            TestComponent_Conditional_1_Template,
            1,
            0
          );
        }
        if (rf & 2) {
          i0.ɵɵconditional(true ? 0 : 1);
        }
      },
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
                template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
                standalone: false
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
        filePath: "conditional_same_component_names.ts",
        lineNumber: 16
      });
  })();
});
it("case 2", () => {
  class TestComponent {
    static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || TestComponent)();
    };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: TestComponent,
      selectors: [["ng-component"]],
      standalone: false,
      decls: 2,
      vars: 1,
      template: function TestComponent_Template1(rf, ctx) {
        if (rf & 1) {
          i0.ɵɵconditionalCreate(0, TestComponent_Conditional_0_Template1, 1, 0)(
            1,
            TestComponent_Conditional_1_Template1,
            1,
            0
          );
        }
        if (rf & 2) {
          i0.ɵɵconditional(true ? 0 : 1);
        }
      },
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
                template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
                standalone: false
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
        filePath: "conditional_same_component_names.ts",
        lineNumber: 31
      });
  })();
});
