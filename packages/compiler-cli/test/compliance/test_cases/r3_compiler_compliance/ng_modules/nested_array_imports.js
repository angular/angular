…
export class NestedModule {
  static ɵfac = function NestedModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NestedModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NestedModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[ModA, ModB], GROUP] });
}
…
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(NestedModule, { imports: [ModA, ModB, ModA, ModB] }); })();
