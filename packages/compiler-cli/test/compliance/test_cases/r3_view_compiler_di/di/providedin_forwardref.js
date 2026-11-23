import { forwardRef, Injectable, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class Dep {
  static ɵfac = function Dep_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Dep)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Dep, factory: Dep.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Dep,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class Service {
  constructor(dep) {}
  static ɵfac = function Service_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep));
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Service,
    factory: Service.ɵfac,
    providedIn: i0.forwardRef(() => Mod)
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Service,
      [
        {
          type: Injectable,
          args: [{ providedIn: forwardRef(() => Mod) }]
        }
      ],
      () => [{ type: Dep }],
      null
    );
})();
export class Mod {
  static ɵfac = function Mod_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Mod)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Mod });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Mod,
      [
        {
          type: NgModule
        }
      ],
      null,
      null
    );
})();
