class CustomInjectable {
  …
  static ɵfac = …;
  static ɵprov = …;
}
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(CustomInjectable, [{
    type: Injectable
  }], () => [{
      type: Service,
      decorators: []
    }], null);
})();
