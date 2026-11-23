import { forwardRef, Injectable } from "@angular/core";
import * as i0 from "@angular/core";
class SomeProvider {
  static ɵfac = function SomeProvider_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SomeProvider)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: SomeProvider,
    factory: __ngFactoryType__ => SomeProviderImpl.ɵfac(__ngFactoryType__),
    providedIn: "root"
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeProvider,
      [
        {
          type: Injectable,
          args: [{ providedIn: "root", useClass: forwardRef(() => SomeProviderImpl) }]
        }
      ],
      null,
      null
    );
})();
class SomeProviderImpl extends SomeProvider {
  static ɵfac = /*@__PURE__*/ (() => {
    let ɵSomeProviderImpl_BaseFactory;
    return function SomeProviderImpl_Factory(__ngFactoryType__) {
      return (
        ɵSomeProviderImpl_BaseFactory ||
        (ɵSomeProviderImpl_BaseFactory = i0.ɵɵgetInheritedFactory(SomeProviderImpl))
      )(__ngFactoryType__ || SomeProviderImpl);
    };
  })();
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: SomeProviderImpl,
    factory: SomeProviderImpl.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      SomeProviderImpl,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
