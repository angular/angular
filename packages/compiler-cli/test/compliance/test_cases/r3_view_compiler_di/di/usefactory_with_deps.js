MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(t) {
    let r = null;
    if (t) {
      r = new t();
    } else {
      r = ((dep) => new MyAlternateService(dep))($r3$.ɵɵinject(SomeDep));
    }
    return r;
  },
  providedIn: 'root'
});
// ...
MyOptionalService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyOptionalService,
  factory: function MyOptionalService_Factory(t) {
    let r = null;
    if (t) {
      r = new t();
    } else {
      r = ((dep) => new MyAlternateService(dep))($r3$.ɵɵinject(SomeDep, 8));
    }
    return r;
  },
  providedIn: 'root'
});
