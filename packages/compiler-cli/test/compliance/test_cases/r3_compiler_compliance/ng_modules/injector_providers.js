…
export class ProvidersModule {
  static ɵfac = function ProvidersModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ProvidersModule)(); };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ProvidersModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [
    Impl,
    { provide: Base, useClass: Impl },
    { provide: Legacy, useExisting: Impl },
    { provide: TOKEN, useValue: 'hello' },
    { provide: MULTI, useValue: 'a', multi: true },
    { provide: MULTI, useValue: 'b', multi: true },
    { provide: 'STR', useFactory: …b… => b, deps: [Base] },
  ] });
}
…
