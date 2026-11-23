var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
import { Component, InjectionToken } from "@angular/core";
import * as i0 from "@angular/core";
var token = new InjectionToken("token");
export function Custom() {
  return function (target) {};
}
var Comp = /** @class */ (function () {
  function Comp() {}
  Comp.ɵfac = function Comp_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Comp)();
  };
  Comp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Comp,
    selectors: [["ng-component"]],
    features: [i0.ɵɵProvidersFeature([{ provide: token, useExisting: Comp }])],
    decls: 0,
    vars: 0,
    template: function Comp_Template(rf, ctx) {},
    encapsulation: 2
  });
  Comp = __decorate([Custom()], Comp);
  return Comp;
})();
export { Comp };
(function () {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Comp,
      [
        {
          type: Component,
          args: [
            {
              template: "",
              providers: [{ provide: token, useExisting: Comp }]
            }
          ]
        }
      ],
      null,
      null
    );
})();
(function () {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Comp, {
      className: "Comp",
      filePath: "custom_decorator_es5.ts",
      lineNumber: 14
    });
})();
