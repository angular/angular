…
export class AppModule {
  static ɵfac = function AppModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [LibModule.forRoot('app')] });
}
…
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AppModule, { imports: [LibModule.forRoot('app')] }); })();
