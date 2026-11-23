import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function TestComponent_Primary_1_Primary_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Inner Main ");
  }
}
function TestComponent_Primary_1_Error_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Inner Fallback ");
  }
}
function TestComponent_Primary_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Outer Main ");
    i0.ɵɵboundaryCreate(1);
    i0.ɵɵconditionalBranchCreate(2, TestComponent_Primary_1_Primary_2_Template, 1, 0)(
      3,
      TestComponent_Primary_1_Error_3_Template,
      1,
      0
    );
  }
  if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵboundaryUpdate(1, i0.ɵɵgetBoundary(1).error === null ? 2 : 3, 2);
  }
}
function TestComponent_Error_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Outer Fallback ");
  }
}
export class TestComponent {
  static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 1,
    template: function TestComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵboundaryCreate(0);
        i0.ɵɵconditionalBranchCreate(1, TestComponent_Primary_1_Template, 4, 1)(
          2,
          TestComponent_Error_2_Template,
          1,
          0
        );
      }
      if (rf & 2) {
        i0.ɵɵboundaryUpdate(0, i0.ɵɵgetBoundary(0).error === null ? 1 : 2, 1);
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
    @boundary {
      Outer Main
      @boundary {
        Inner Main
      } @error {
        Inner Fallback
      }
    } @error {
      Outer Fallback
    }
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
    i0.ɵsetClassDebugInfo(TestComponent, {
      className: "TestComponent",
      filePath: "nested.ts",
      lineNumber: 17
    });
})();
