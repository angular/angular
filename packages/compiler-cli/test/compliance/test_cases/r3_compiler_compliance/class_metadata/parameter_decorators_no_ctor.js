export class NoCtor {
  …
  static ɵfac = …;
  static ɵprov = …;
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(NoCtor, [{
    type: Injectable
  }], null, null);
})();
