MyService.ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function MyService_Factory(ɵt) {
    let ɵr = null;
    if (ɵt) {
      ɵr = new ɵt();
    } else {
      ɵr = new MyAlternateService($r3$.ɵɵinject(SomeDep));
    }
    return ɵr;
  },
  providedIn: 'root'
});
