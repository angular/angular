Service.ɵfac = function Service_Factory(t) { return new (t || Service)($i0$.ɵɵinject(Dep)); };
Service.ɵprov = /*@__PURE__*/ $i0$.ɵɵdefineInjectable({ token: Service, factory: Service.ɵfac, providedIn: $i0$.forwardRef(function () { return Mod; }) });
export { Service };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(Service, [{
  type: Injectable,
  args: [{ providedIn: forwardRef(() => Mod) }]
}], function () { return [{ type: Dep }]; }, null); })();
class Mod {
}
