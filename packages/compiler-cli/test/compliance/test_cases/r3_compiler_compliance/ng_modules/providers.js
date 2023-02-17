class FooModule {}
FooModule.ɵfac = function FooModule_Factory(t) { return new (t || FooModule)(); };
FooModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
FooModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
    Thing,
    BaseService,
    ChildService,
    { provide: MY_TOKEN, useFactory: …child… => ({ child }), deps: [ChildService] }…
  ]
});
export { FooModule };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooModule, [{
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
