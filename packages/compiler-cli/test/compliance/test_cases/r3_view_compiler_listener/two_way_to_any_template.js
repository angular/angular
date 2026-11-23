import { Component, Directive, model } from "@angular/core";
import * as i0 from "@angular/core";
export class NgModelDirective {
  ngModel = model(
    "" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "ngModel" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function NgModelDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NgModelDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgModelDirective,
    selectors: [["", "ngModel", ""]],
    inputs: { ngModel: [1, "ngModel"] },
    outputs: { ngModel: "ngModelChange" }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NgModelDirective,
      [
        {
          type: Directive,
          args: [{ selector: "[ngModel]" }]
        }
      ],
      null,
      {
        ngModel: [
          { type: i0.Input, args: [{ isSignal: true, alias: "ngModel", required: false }] },
          { type: i0.Output, args: ["ngModelChange"] }
        ]
      }
    );
})();
export class TestCmp {
  value = 123;
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    decls: 1,
    vars: 1,
    consts: [[3, "ngModelChange", "ngModel"]],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelementStart(0, "input", 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵtwoWayListener(
          "ngModelChange",
          function TestCmp_Template_input_ngModelChange_0_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.value, $event) || (ctx.value = $event);
            return $event;
          }
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtwoWayProperty("ngModel", ctx.value);
        i0.ɵɵcontrol();
      }
    },
    dependencies: [NgModelDirective],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      TestCmp,
      [
        {
          type: Component,
          args: [
            {
              selector: "test-cmp",
              template: '<input [(ngModel)]="$any(value)">',
              imports: [NgModelDirective]
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "two_way_to_any.ts",
      lineNumber: 13
    });
})();
