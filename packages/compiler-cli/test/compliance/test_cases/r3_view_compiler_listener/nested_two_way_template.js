import { Component, Directive, EventEmitter, Input, NgModule, Output } from "@angular/core";
import * as i0 from "@angular/core";
function TestCmp_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "input", 0);
    i0.ɵɵcontrolCreate();
    i0.ɵɵtwoWayListener(
      "ngModelChange",
      function TestCmp_ng_template_1_Template_input_ngModelChange_0_listener($event) {
        i0.ɵɵrestoreView(_r1);
        const ctx_r1 = i0.ɵɵnextContext();
        i0.ɵɵtwoWayBindingSet(ctx_r1.name, $event) || (ctx_r1.name = $event);
        return i0.ɵɵresetView($event);
      }
    );
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.name);
    i0.ɵɵcontrol();
  }
}
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
    vars: 0,
    consts: [[3, "ngModelChange", "ngModel"]],
    template: function TestCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "Name: ");
        i0.ɵɵtemplate(1, TestCmp_ng_template_1_Template, 1, 1, "ng-template");
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
              template: 'Name: <ng-template><input [(ngModel)]="name"></ng-template>',
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
      filePath: "nested_two_way.ts",
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
