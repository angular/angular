export class AModule {}
AModule.ɵfac = function AModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AModule)(); };
AModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule });
AModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [A1Component, A2Component] });
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AModule, [{
    type: NgModule,
    args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
  }], null, null);
})();
…

export class BModule {}
BModule.ɵfac = function BModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BModule)(); };
BModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule });
BModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [AModule] });
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BModule, [{
    type: NgModule,
    args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
  }], null, null);
})();
…

export class AppModule {}
AppModule.ɵfac = function AppModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppModule)(); };
AppModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
AppModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [BModule] });
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppModule, [{
    type: NgModule,
    args: [{ imports: [BModule] }]
  }], null, null);
})();
