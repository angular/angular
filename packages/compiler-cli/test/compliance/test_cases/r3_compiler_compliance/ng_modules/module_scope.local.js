…
export class MyModule {
  static ɵfac = function MyModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MyModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SharedModule, MyComponent, SharedModule] });
}
…
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent, MyDirective, MyPipe], imports: [SharedModule], exports: [MyComponent, SharedModule] }); })();
