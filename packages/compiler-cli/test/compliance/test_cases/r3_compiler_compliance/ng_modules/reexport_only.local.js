…
export class ParentModule {
  static ɵfac = function ParentModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ParentModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ParentModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [ChildModule] });
}
…
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(ParentModule, { exports: [ChildModule] }); })();
