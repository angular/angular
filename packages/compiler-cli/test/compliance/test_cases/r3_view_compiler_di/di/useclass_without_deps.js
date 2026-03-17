export class MyService {
  // ...
  static ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
    token: MyService,
    factory: __ngFactoryType__ => MyAlternateService.ɵfac(__ngFactoryType__),
    providedIn: 'root'
  });
}
