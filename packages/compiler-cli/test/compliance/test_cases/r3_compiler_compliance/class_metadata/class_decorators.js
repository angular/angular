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
import { Component, Injectable } from "@angular/core";
import { CustomClassDecorator } from "./custom";
import * as i0 from "@angular/core";
export class BasicInjectable {
  static ɵfac = function BasicInjectable_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BasicInjectable)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: BasicInjectable,
    factory: BasicInjectable.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BasicInjectable,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class RootInjectable {
  static ɵfac = function RootInjectable_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || RootInjectable)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: RootInjectable,
    factory: RootInjectable.ɵfac,
    providedIn: "root"
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      RootInjectable,
      [
        {
          type: Injectable,
          args: [{ providedIn: "root" }]
        }
      ],
      null,
      null
    );
})();
let CustomInjectable = class CustomInjectable {
  static ɵfac = function CustomInjectable_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CustomInjectable)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: CustomInjectable,
    factory: CustomInjectable.ɵfac
  });
};
CustomInjectable = __decorate([CustomClassDecorator()], CustomInjectable);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      CustomInjectable,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class ComponentWithExternalResource {
  static ɵfac = function ComponentWithExternalResource_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ComponentWithExternalResource)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ComponentWithExternalResource,
    selectors: [["test-cmp"]],
    decls: 2,
    vars: 0,
    template: function ComponentWithExternalResource_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, "span");
        i0.ɵɵtext(1, "Test template");
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ComponentWithExternalResource,
      [
        {
          type: Component,
          args: [{ selector: "test-cmp", template: "<span>Test template</span>\n" }]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(ComponentWithExternalResource, {
      className: "ComponentWithExternalResource",
      filePath: "class_decorators.ts",
      lineNumber: 22
    });
})();
