import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = ["*"];
function SimpleComponent_ng_content_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0);
  }
}
export class FakeNgIf {
  static ɵfac = function FakeNgIf_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FakeNgIf)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FakeNgIf,
    selectors: [["", "ngIf", ""]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      FakeNgIf,
      [
        {
          type: Directive,
          args: [{ selector: "[ngIf]" }]
        }
      ],
      null,
      null
    );
})();
export class SimpleComponent {
  showContent = true;
  static ɵfac = function SimpleComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SimpleComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: SimpleComponent,
    selectors: [["simple"]],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 1,
    consts: [[4, "ngIf"]],
    template: function SimpleComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef();
        i0.ɵɵtemplate(0, SimpleComponent_ng_content_0_Template, 1, 0, "ng-content", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("ngIf", ctx.showContent);
      }
    },
    dependencies: [FakeNgIf],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SimpleComponent,
      [
        {
          type: Component,
          args: [
            {
              imports: [FakeNgIf],
              selector: "simple",
              template: '<ng-content *ngIf="showContent"></ng-content>'
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
    i0.ɵsetClassDebugInfo(SimpleComponent, {
      className: "SimpleComponent",
      filePath: "ng_content_with_structural_dir.ts",
      lineNumber: 11
    });
})();
