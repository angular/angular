export class MyService {
  // ...
  static ɵprov = /*@__PURE__*/ $r3$.ɵɵdefineInjectable({
    token: MyService,
    factory: () => alternateFactory(),
    providedIn: 'root'
  });
}
