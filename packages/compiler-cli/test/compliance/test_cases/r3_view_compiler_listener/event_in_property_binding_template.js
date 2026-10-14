import { Component, Directive, Input, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class DivDir {
  event;
  static ɵfac = function DivDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DivDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: DivDir,
    selectors: [["div"]],
    inputs: { event: "event" },
    standalone: false
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DivDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "div",
              standalone: false
            }
          ]
        }
      ],
      null,
      {
        event: [
          {
            type: Input
          }
        ]
      }
    );
})();
class Comp {
  $event = 1;
  static ɵfac = function Comp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Comp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [["ng-component"]],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, "event"]],
    template: function Comp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵelement(0, "div", 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty("event", ctx.$event);
      }
    },
    dependencies: [DivDir],
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Comp,
      [
        {
          type: Component,
          args: [
            {
              template: '<div [event]="$event"></div>',
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
    i0.ɵsetClassDebugInfo(Comp, {
      className: "Comp",
      filePath: "event_in_property_binding.ts",
      lineNumber: 15
    });
})();
export class MyMod {
  static ɵfac = function MyMod_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyMod)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyMod });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyMod,
      [
        {
          type: NgModule,
          args: [{ declarations: [Comp, DivDir] }]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngJitMode === "undefined" || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyMod, { declarations: [Comp, DivDir] });
})();
