MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(__ngFactoryType__) {
    let __ngConditionalFactory__ = null;
    if (__ngFactoryType__) {
      __ngConditionalFactory__ = new __ngFactoryType__();
    } else {
      __ngConditionalFactory__ = new MyAlternateService($r3$.ɵɵinject(SomeDep));
    }
    return __ngConditionalFactory__;
  },
  providedIn: 'root'
});
