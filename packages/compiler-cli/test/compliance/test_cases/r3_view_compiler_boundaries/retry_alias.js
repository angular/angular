import { Component } from "@angular/core";
import * as i0 from "@angular/core";
function TestComponent_Primary_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Main Content ");
  }
}
function TestComponent_Error_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵdomElementStart(0, "button", 0);
    i0.ɵɵdomListener("click", function TestComponent_Error_2_Template_button_click_0_listener() {
      const ctx_r1 = i0.ɵɵrestoreView(_r1);
      return i0.ɵɵresetView(ctx_r1.$reset());
    });
    i0.ɵɵtext(1, "Retry");
    i0.ɵɵdomElementEnd();
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
    consts: [[3, "click"]],
    template: function TestComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵboundaryCreate(0);
        i0.ɵɵconditionalBranchCreate(1, TestComponent_Primary_1_Template, 1, 0)(
          2,
          TestComponent_Error_2_Template,
          2,
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
      Main Content
    } @error (let err, retry = $reset) {
      <button (click)="retry()">Retry</button>
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
      filePath: "retry_alias.ts",
      lineNumber: 12
    });
})();
