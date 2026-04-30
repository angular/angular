class Alternate {}

export class MyService {
  static ɵfac = function MyService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MyService)(); };
  static ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineService({ token: MyService, factory: () => (() => new Alternate())() });
}

(() => { (typeof ngDevMode === "undefined" || ngDevMode) && $r3$.ɵsetClassMetadata(MyService, [{
    type: Service,
    args: [{ factory: () => new Alternate() }]
}], null, null); })();
