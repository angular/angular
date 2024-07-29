MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(ɵt) {
    let ɵr = null;
    if (ɵt) {
      ɵr = new ɵt();
    } else {
      ɵr = ((dep, optional) => new MyAlternateService(dep, optional))($r3$.ɵɵinject(SomeDep), $r3$.ɵɵinject(SomeDep, 8));
    }
    return ɵr;
  },
  providedIn: 'root'
});
