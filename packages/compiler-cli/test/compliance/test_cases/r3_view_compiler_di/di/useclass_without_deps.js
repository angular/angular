MyService.ɵprov = $r3$.ɵɵdefineInjectable({
  token: MyService,
  factory: function(t) {
    return MyAlternateService.ɵfac(t);
  },
  providedIn: 'root'
});
