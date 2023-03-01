MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(t) {
    let r = null;
    if (t) {
      r = new t();
    } else {
      r = new MyAlternateService($r3$.ɵɵinject(SomeDep));
    }
    return r;
  },
  providedIn: 'root'
});
