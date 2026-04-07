export class DerivedInjectable extends ParameterizedInjectable {
  …
  static ɵfac = …;
  static ɵprov = …;
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(DerivedInjectable, [{
    type: Injectable
  }], null, null);
})();

…

export class DerivedInjectableWithCtor extends ParameterizedInjectable {
  …
  static ɵfac = …;
  static ɵprov = …;
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(DerivedInjectableWithCtor, [{
    type: Injectable
  }], () => [], null);
})();
