import { Component, Directive, Input } from "@angular/core";
import * as i0 from "@angular/core";
function MyApp_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 0);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("binding", 3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
function MyApp_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("binding", 6);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
function MyApp_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 2);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("binding", 9);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.expr);
  }
}
export class Binding {
  binding = 0;
  static ɵfac = function Binding_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Binding)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: Binding,
    selectors: [["", "binding", ""]],
    inputs: { binding: "binding" }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Binding,
      [
        {
          type: Directive,
          args: [{ selector: "[binding]" }]
        }
      ],
      null,
      {
        binding: [
          {
            type: Input
          }
        ]
      }
    );
})();
export class MyApp {
  expr = 0;
  static ɵfac = function MyApp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyApp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [["ng-component"]],
    decls: 3,
    vars: 1,
    consts: [
      ["foo", "1", "bar", "2", 3, "binding"],
      ["foo", "4", "bar", "5", 3, "binding"],
      ["foo", "7", "bar", "8", 3, "binding"]
    ],
    template: function MyApp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 2, "div", 0)(
          1,
          MyApp_Conditional_1_Template,
          2,
          2,
          "div",
          1
        )(2, MyApp_Conditional_2_Template, 2, 2, "div", 2);
      }
      if (rf & 2) {
        i0.ɵɵconditional(ctx.expr === 0 ? 0 : ctx.expr === 1 ? 1 : 2);
      }
    },
    dependencies: [Binding],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyApp,
      [
        {
          type: Component,
          args: [
            {
              template: `
    @if (expr === 0) {
      <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    } @else if (expr === 1) {
      <div foo="4" bar="5" [binding]="6">{{expr}}</div>
    } @else {
      <div foo="7" bar="8" [binding]="9">{{expr}}</div>
    }
  `,
              imports: [Binding]
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: "MyApp",
      filePath: "if_element_root_node.ts",
      lineNumber: 20
    });
})();
