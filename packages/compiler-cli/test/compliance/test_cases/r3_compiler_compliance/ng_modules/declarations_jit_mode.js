export class FooComponent {
  …
  static ɵfac = …;
  static ɵcmp = …;
}
…
export class BarDirective {
  …
  static ɵfac = …;
  static ɵdir = …;
}
…
export class QuxPipe {
  …
  static ɵfac = …;
  static ɵpipe = …;
}
…
export class FooModule {
  static ɵfac = function FooModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FooModule)(); };
  static ɵmod = /*@__PURE__*/ $i0$.ɵɵdefineNgModule({type: FooModule, bootstrap: [FooComponent], declarations: [FooComponent, BarDirective, QuxPipe]});
  static ɵinj = /*@__PURE__*/ $i0$.ɵɵdefineInjector({});
}
…
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FooModule, [{
    type: NgModule,
    args: [{ declarations: [FooComponent, BarDirective, QuxPipe], bootstrap: [FooComponent] }]
  }], null, null);
})();
