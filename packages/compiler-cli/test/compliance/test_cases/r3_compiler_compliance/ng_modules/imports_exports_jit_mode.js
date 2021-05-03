export class AModule {}
AModule.ɵfac = function AModule_Factory(t) { return new (t || AModule)(); };
AModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AModule, declarations: [A1Component, A2Component], exports: [A1Component, A2Component] });
AModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
…
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AModule, [{
  type: NgModule,
  args: [{ declarations: [A1Component, A2Component], exports: [A1Component, A2Component] }]
}], null, null); })();
…

export class BModule {}
BModule.ɵfac = function BModule_Factory(t) { return new (t || BModule)(); };
BModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BModule, declarations: [B1Component, B2Component], exports: [AModule] });
BModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [AModule] });
…
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BModule, [{
        type: NgModule,
        args: [{ declarations: [B1Component, B2Component], exports: [AModule] }]
    }], null, null); })();
…

export class AppModule {}
AppModule.ɵfac = function AppModule_Factory(t) { return new (t || AppModule)(); };
AppModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule, imports: [BModule] });
AppModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[BModule]] });
…
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppModule, [{
  type: NgModule,
  args: [{ imports: [BModule] }]
}], null, null); })();