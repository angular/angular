export class AModule {
  static ɵfac = function AModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule, declarations: [A1Component, A2Component], exports: [A1Component, A2Component] });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AModule, [{
    type: NgModule,
    args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
  }], null, null);
})();
…
export class BModule {
  static ɵfac = function BModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule, declarations: [B1Component, B2Component], exports: [AModule] });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [AModule] });
}
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BModule, [{
    type: NgModule,
    args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
  }], null, null);
})();
…
export class AppModule {
  static ɵfac = function AppModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule, imports: [BModule] });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [BModule] });
}
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppModule, [{
    type: NgModule,
    args: [{ imports: [BModule] }]
  }], null, null);
})();
