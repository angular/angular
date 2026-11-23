…
import { Component, Input, ViewChild, ViewChildren } from "@angular/core";
import { Box, Custom, Dep, Fallback, OtherDep, Registered } from "./deps";
import * as i0 from "@angular/core";
…
export class MyCmp {
  el;
  els;
  model;
  dep;
  box;
  other;
  registered;
  fallback;
  static ɵfac = function MyCmp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyCmp)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCmp,
    selectors: [["my-cmp"]],
    viewQuery: function MyCmp_Query(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵviewQuery(_c0, 5)(_c0, 5);
      }
      if (rf & 2) {
        let _t;
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.el = _t.first);
        i0.ɵɵqueryRefresh((_t = i0.ɵɵloadQuery())) && (ctx.els = _t);
      }
    },
    inputs: {
      model: "model",
      dep: "dep",
      box: "box",
      other: "other",
      registered: "registered",
      fallback: "fallback"
    },
    decls: 2,
    vars: 0,
    consts: [["el", ""]],
    template: function MyCmp_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "div", null, 0);
      }
    },
    encapsulation: 2
  });
}
__decorate([Custom(), __metadata("design:type", …)], MyCmp.prototype, "dep", void 0);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyCmp,
      [
        {
          type: Component,
          args: [{ selector: "my-cmp", template: "<div #el></div>" }]
        }
      ],
      null,
      {
        el: [
          {
            type: ViewChild,
            args: ["el"]
          }
        ],
        els: [
          {
            type: ViewChildren,
            args: ["el"]
          }
        ],
        model: [
          {
            type: Input
          }
        ],
        dep: [
          {
            type: Input
          }
        ],
        box: [
          {
            type: Input
          }
        ],
        other: [
          {
            type: Input
          }
        ],
        registered: [
          {
            type: Input
          }
        ],
        fallback: [
          {
            type: Input
          }
        ]
      }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyCmp, {
      className: "MyCmp",
      filePath: "unreferenced_imports.ts",
      lineNumber: 6
    });
})();
export const NumberBox = Box;
export const registry = { Registered };
export function valueOf(options) {
  let value;
  ({ value = Fallback } = options);
  return value;
}
export { OtherDep };
