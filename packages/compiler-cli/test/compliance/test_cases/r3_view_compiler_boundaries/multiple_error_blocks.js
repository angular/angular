import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function TestComponent_Primary_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Main Content ");
  }
}
function TestComponent_Error_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Not Found ");
  }
}
function TestComponent_Error_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Generic Error ");
  }
}
export class TestComponent {
  static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [["ng-component"]],
    decls: 4,
    vars: 1,
    template: function TestComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵboundaryCreate(0);
        i0.ɵɵconditionalBranchCreate(1, TestComponent_Primary_1_Template, 1, 0)(
          2,
          TestComponent_Error_2_Template,
          1,
          0
        )(3, TestComponent_Error_3_Template, 1, 0);
      }
      if (rf & 2) {
        const bnd_r1 = i0.ɵɵgetBoundary(0);
        i0.ɵɵboundaryUpdate(
          0,
          bnd_r1.error === null ? 1 : bnd_r1.error.message === "404" ? 2 : 3,
          1
        );
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
      Main Content
    } @error (let err; when err.message === '404') {
      Not Found
    } @error (let err) {
      Generic Error
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
      filePath: "multiple_error_blocks.ts",
      lineNumber: 14
    });
})();
