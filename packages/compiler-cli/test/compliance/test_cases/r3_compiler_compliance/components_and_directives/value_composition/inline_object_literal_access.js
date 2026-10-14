import { Component, input } from "@angular/core";
import * as i0 from "@angular/core";
const _c0 = () => ({ one: "Hello", two: "Hola" });
export class Greeting {
  type = input(
    "one" /* @ts-ignore */,
    ...(ngDevMode ? [{ debugName: "type" }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function Greeting_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Greeting)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Greeting,
    selectors: [["ng-component"]],
    inputs: { type: [1, "type"] },
    decls: 1,
    vars: 2,
    consts: [[3, "title"]],
    template: function Greeting_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "span", 0);
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("title", i0.ɵɵpureFunction0(1, _c0)[ctx.type()]);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Greeting,
      [
        {
          type: Component,
          args: [
            {
              template: `<span [title]="{one: 'Hello', two: 'Hola'}[type()]"></span>`
            }
          ]
        }
      ],
      null,
      { type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: false }] }] }
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Greeting, {
      className: "Greeting",
      filePath: "inline_object_literal_access.ts",
      lineNumber: 6
    });
})();
