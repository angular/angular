import { Component } from "@angular/core";
import * as i0 from "@angular/core";
class Outer {
  constructor() {
    class Inner {
      static ɵfac = function Inner_Factory(__ngFactoryType__) {
        return new (__ngFactoryType__ || Inner)();
      };
      static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
        type: Inner,
        selectors: [["ng-component"]],
        decls: 1,
        vars: 0,
        template: function Inner_Template(rf, ctx) {
          if (rf & 1) {
            i0.ɵɵtext(0, "inner");
          }
        },
        encapsulation: 2
      });
    }
    (() => {
      (typeof ngDevMode === "undefined" || ngDevMode) &&
        i0.ɵsetClassMetadata(
          Inner,
          [
            {
              type: Component,
              args: [
                {
                  template: "inner"
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
        i0.ɵsetClassDebugInfo(Inner, {
          className: "Inner",
          filePath: "nested_component_definition.ts",
          lineNumber: 11
        });
    })();
  }
  static ɵfac = function Outer_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Outer)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Outer,
    selectors: [["ng-component"]],
    decls: 1,
    vars: 0,
    template: function Outer_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵtext(0, "outer");
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Outer,
      [
        {
          type: Component,
          args: [
            {
              template: "outer"
            }
          ]
        }
      ],
      () => [],
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Outer, {
      className: "Outer",
      filePath: "nested_component_definition.ts",
      lineNumber: 6
    });
})();
