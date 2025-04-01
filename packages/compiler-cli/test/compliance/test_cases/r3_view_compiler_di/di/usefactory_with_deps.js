MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(__ngFactoryType__) {
    let __ngConditionalFactory__ = null;
    if (__ngFactoryType__) {
      __ngConditionalFactory__ = new __ngFactoryType__();
    } else {
      __ngConditionalFactory__ = ((dep, optional) => new MyAlternateService(dep, optional))($r3$.ɵɵinject(SomeDep), $r3$.ɵɵinject(SomeDep, 8));
    }
    return __ngConditionalFactory__;
  },
  providedIn: 'root'
});
