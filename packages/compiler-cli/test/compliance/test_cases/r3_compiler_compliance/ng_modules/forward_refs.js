export function provideModule() {
    return { ngModule: ForwardModule };
}
…
export class TestModule {
  …
  static ɵfac = function TestModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TestModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TestModule, imports: () => [ForwardModule] });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [provideModule()] });
}
…
export class ForwardModule {
  static ɵfac = function ForwardModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ForwardModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
}

