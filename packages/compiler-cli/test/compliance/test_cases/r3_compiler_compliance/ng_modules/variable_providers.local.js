const PROVIDERS = [{provide: new InjectionToken('token'), useValue: 1}];
export class FooModule {
  static ɵfac = …;
  static ɵmod = …;
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({providers: PROVIDERS});
}
