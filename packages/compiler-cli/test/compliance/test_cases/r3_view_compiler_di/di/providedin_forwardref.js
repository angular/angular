export class Service {
  …
  static ɵfac = function Service_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || Service)($i0$.ɵɵinject(Dep)); };
  static ɵprov = /*@__PURE__*/ $i0$.ɵɵdefineInjectable({ token: Service, factory: Service.ɵfac, providedIn: $i0$.forwardRef(() => Mod) });
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(Service, [{
    type: Injectable,
    args: [{ providedIn: forwardRef(() => Mod) }]
  }], () => [{ type: Dep }], null);
})();
export class Mod {
  …
}
