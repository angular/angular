export class FooModule {
  static ɵfac = function FooModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FooModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
      Thing,
      BaseService,
      ChildService,
      { provide: MY_TOKEN, useFactory: …child… => ({ child }), deps: [ChildService] }…
    ]
  });
}

(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooModule, [{
  type: NgModule,
  args: [{
    providers: [
      Thing,
      BaseService,
      ChildService,
      { provide: MY_TOKEN, useFactory: …child… => ({ child }), deps: [ChildService] }…
    ]
  }]
}], null, null); })();
