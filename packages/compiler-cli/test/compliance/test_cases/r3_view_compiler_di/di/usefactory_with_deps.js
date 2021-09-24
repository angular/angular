MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(t) {
    let r = null;
    if (t) {
      r = new t();
    } else {
      r = ((dep, optional) => new MyAlternateService(dep, optional))($r3$.ɵɵinject(SomeDep), $r3$.ɵɵinject(SomeDep, 8));
    }
    return r;
  },
  providedIn: 'root'
});
