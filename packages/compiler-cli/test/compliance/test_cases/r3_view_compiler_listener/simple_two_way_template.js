import { Component, Directive, EventEmitter, Input, NgModule, Output } from "@angular/core";
import * as i0 from "@angular/core";
export class TestCmp {
  name = "";
  static ɵfac = function TestCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TestCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    standalone: false,
    decls: 2,
    vars: 1,
    consts: [[3, "ngModelChange", "ngModel"]],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Name: ");
        i0.ɵɵelementStart(1, "input", 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵtwoWayListener(
          "ngModelChange",
          function TestCmp_Template_input_ngModelChange_1_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.name, $event) || (ctx.name = $event);
            return $event;
          }
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("ngModel", ctx.name);
        i0.ɵɵcontrol();
      }
    },
    dependencies: () => [NgModelDirective],
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
              template: 'Name: <input [(ngModel)]="name">',
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: "TestCmp",
      filePath: "simple_two_way.ts",
      lineNumber: 8
    });
})();
export class NgModelDirective {
  ngModel = "";
  ngModelChange = new EventEmitter();
  static ɵfac = function NgModelDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NgModelDirective)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: NgModelDirective,
    selectors: [["", "ngModel", ""]],
    inputs: { ngModel: "ngModel" },
    outputs: { ngModelChange: "ngModelChange" },
    standalone: false
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
              selector: "[ngModel]",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        ngModel: [
          {
            type: Input
          }
        ],
        ngModelChange: [
          {
            type: Output
          }
        ]
      }
    );
})();
export class AppModule {
  static ɵfac = function AppModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AppModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      AppModule,
      [
        {
          type: NgModule,
          args: [{ declarations: [TestCmp, NgModelDirective] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(AppModule, { declarations: [TestCmp, NgModelDirective] });
})();
