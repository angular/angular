import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = [[["basic"]], "*", [["footer"]], [["structural"]]];
const _c1 = ["basic", "*", "footer", "structural"];
function TestComponent_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, "Basic fallback");
  }
}
function TestComponent_ProjectionFallback_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "h1");
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "strong");
    i0.ɵɵtext(3, "content");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4, "!");
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1("This is ", ctx_r0.type, " ");
  }
}
function TestComponent_Conditional_5_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵtext(0, " Inside control flow ");
  }
}
function TestComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0, 2, null, TestComponent_Conditional_5_ProjectionFallback_0_Template, 1, 0);
  }
}
function TestComponent_ng_content_6_ProjectionFallback_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "h2");
    i0.ɵɵtext(1, "With a structural directive");
    i0.ɵɵelementEnd();
  }
}
function TestComponent_ng_content_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojection(0, 3, null, TestComponent_ng_content_6_ProjectionFallback_0_Template, 2, 0);
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
export class TestComponent {
  type = "complex";
  hasFooter = false;
  hasStructural = false;
  static ɵfac = function TestComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComponent,
    selectors: [["test"]],
    ngContentSelectors: _c1,
    decls: 7,
    vars: 2,
    consts: [[4, "ngIf"]],
    template: function TestComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵprojectionDef(_c0);
        i0.ɵɵprojection(0, 0, null, TestComponent_ProjectionFallback_0_Template, 1, 0);
        i0.ɵɵelementStart(2, "div");
        i0.ɵɵprojection(3, 1, null, TestComponent_ProjectionFallback_3_Template, 5, 1);
        i0.ɵɵelementEnd();
        i0.ɵɵconditionalCreate(5, TestComponent_Conditional_5_Template, 2, 0);
        i0.ɵɵtemplate(6, TestComponent_ng_content_6_Template, 2, 0, "ng-content", 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance(5);
        i0.ɵɵconditional(ctx.hasFooter ? 5 : -1);
        i0.ɵɵadvance();
        i0.ɵɵproperty("ngIf", ctx.hasStructural);
      }
    },
    dependencies: [FakeNgIf],
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
              imports: [FakeNgIf],
              template: `
    <ng-content select="basic">Basic fallback</ng-content>

    <div>
      <ng-content>
        <h1>This is {{type}} <strong>content</strong>!</h1>
      </ng-content>
    </div>

    @if (hasFooter) {
      <ng-content select="footer">
        Inside control flow
      </ng-content>
    }

    <ng-content select="structural" *ngIf="hasStructural">
      <h2>With a structural directive</h2>
    </ng-content>
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
      filePath: "ng_content_fallback.ts",
      lineNumber: 28
    });
})();
