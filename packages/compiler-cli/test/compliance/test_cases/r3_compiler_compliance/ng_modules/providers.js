export class FooModule {}
FooModule.ɵfac = function FooModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FooModule)(); };
FooModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
FooModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
    Thing,
    BaseService,
    ChildService,
    { provide: MY_TOKEN, useFactory: …child… => ({ child }), deps: [ChildService] }…
  ]
});
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
