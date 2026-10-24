import { Component, Directive } from "@angular/core";
import * as i0 from "@angular/core";
function MyComponent_p_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵanimateEnter("slide");
    i0.ɵɵtext(1, "Sliding Content");
    i0.ɵɵelementEnd();
  }
}
export class AnyStructuralDirective {
  static ɵfac = function AnyStructuralDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AnyStructuralDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: AnyStructuralDirective,
    selectors: [["", "any-structural-directive", ""]]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AnyStructuralDirective,
      [
        {
          type: Directive,
          args: [
            {
              selector: "[any-structural-directive]"
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class MyComponent {
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 2,
    vars: 0,
    consts: [[4, "any-structural-directive"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "div");
        i0.ɵɵtemplate(1, MyComponent_p_1_Template, 2, 0, "p", 0);
        i0.ɵɵelementEnd();
      }
    },
    dependencies: [AnyStructuralDirective],
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
              imports: [AnyStructuralDirective],
              template: `
    <div>
      <p *any-structural-directive animate.enter="slide">Sliding Content</p>
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
      filePath: "animate_enter_with_structural_directive.ts",
      lineNumber: 17
    });
})();
