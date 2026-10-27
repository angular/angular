import { Component, Directive, model, signal } from "@angular/core";
import * as i0 from "@angular/core";
function TestCmp_For_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 1);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener(
      "ngModelChange",
      function TestCmp_For_1_Template_input_ngModelChange_0_listener($event) {
        const name_r2 = i0.ɵɵrestoreView(_r1).$implicit;
        i0.ɵɵtwoWayBindingSet(name_r2, $event);
        return i0.ɵɵresetView($event);
      }
    );
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const name_r2 = ctx.$implicit;
    i0.ɵɵtwoWayProperty("ngModel", name_r2);
    i0.ɵɵcontrol();
  }
}
export class NgModelDirective {
  ngModel = model.required(
    /* @ts-ignore */
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
          args: [
            {
              selector: "[ngModel]"
            }
          ]
        }
      ],
      null,
      {
        ngModel: [
          { type: i0.Input, args: [{ isSignal: true, alias: "ngModel", required: true }] },
          { type: i0.Output, args: ["ngModelChange"] }
        ]
      }
    );
})();
export class TestCmp {
  names = [signal("Angular")];
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["ng-component"]],
    decls: 2,
    vars: 0,
    consts: [
      [3, "ngModel"],
      [3, "ngModelChange", "ngModel"]
    ],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(0, TestCmp_For_1_Template, 1, 1, "input", 0, i0.ɵɵrepeaterTrackByIndex);
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.names);
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
              template: `
    @for (name of names; track $index) {
      <input [(ngModel)]="name" />
    }
  `,
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
      filePath: "two_way_binding_to_signal_loop_variable.ts",
      lineNumber: 18
    });
})();
