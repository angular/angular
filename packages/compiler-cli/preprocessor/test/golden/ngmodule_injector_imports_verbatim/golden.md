# /out/app.module.ts
```ts
import { forwardRef, NgModule } from '@angular/core';
import { EXTERNAL_ALIAS, OtherModule, SharedModule, StandaloneDir, USE_SHARED } from './shared';
// @ts-ignore
import * as i0 from '@angular/core';

// Non-ASCII ahead of every `imports` array below, so that each element's UTF-8 byte span
// differs from its UTF-16 offset: 共有モジュール 🎁📦 — a re-printed element that were sliced
// with unconverted offsets would come out truncated or mid-character.
const LOCAL_ALIAS = [SharedModule, OtherModule];
const MIXED_ALIAS = [SharedModule, StandaloneDir];
const MWP_ALIAS = SharedModule.forRoot();

// An identifier aliasing an array of modules is kept as written: every reference it
// contributes survives filtering, so ngtsc emits the user's expression rather than
// expanding the alias into its members.
export class LocalAliasModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalAliasModule, never> = function LocalAliasModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || LocalAliasModule)();
  };
  // @ts-ignore
  static ɵmod: LocalAliasModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LocalAliasModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LocalAliasModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [LOCAL_ALIAS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalAliasModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [LOCAL_ALIAS],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LocalAliasModule, { imports: [LOCAL_ALIAS] });
})();

// The same holds for an alias imported from another file — the identifier is emitted, not
// the individual references it resolves to (which would need a different import).
export class ExternalAliasModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ExternalAliasModule, never> =
    function ExternalAliasModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ExternalAliasModule)();
    };
  // @ts-ignore
  static ɵmod: ExternalAliasModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ExternalAliasModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ExternalAliasModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [EXTERNAL_ALIAS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ExternalAliasModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [EXTERNAL_ALIAS],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ExternalAliasModule, { imports: [EXTERNAL_ALIAS] });
})();

// An identifier bound to a `ModuleWithProviders` result must stay verbatim: emitting the
// resolved `SharedModule` reference instead would silently drop the providers the
// `forRoot()` call carries.
export class MwpAliasModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpAliasModule, never> = function MwpAliasModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MwpAliasModule)();
  };
  // @ts-ignore
  static ɵmod: MwpAliasModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MwpAliasModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpAliasModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MWP_ALIAS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpAliasModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [MWP_ALIAS],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MwpAliasModule, { imports: [MWP_ALIAS] });
})();

// A ternary is emitted as written, so the branch is still chosen at runtime — static
// evaluation only picks a branch to build the compile-time scope, and never decides the
// element's emission.
export class TernaryModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TernaryModule, never> = function TernaryModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TernaryModule)();
  };
  // @ts-ignore
  static ɵmod: TernaryModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TernaryModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TernaryModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [USE_SHARED ? SharedModule : OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TernaryModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [USE_SHARED ? SharedModule : OtherModule],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(TernaryModule, { imports: [USE_SHARED ? SharedModule : OtherModule] });
})();

// A spread contributes its argument: `...LOCAL_ALIAS` is treated exactly like a direct
// reference to `LOCAL_ALIAS`, so the spread itself disappears from the injector imports.
export class SpreadModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SpreadModule, never> = function SpreadModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SpreadModule)();
  };
  // @ts-ignore
  static ɵmod: SpreadModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SpreadModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SpreadModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [...LOCAL_ALIAS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SpreadModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [...LOCAL_ALIAS],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(SpreadModule, { imports: [...LOCAL_ALIAS] });
})();

// A spread sitting next to a `ModuleWithProviders` call must not cost the call its verbatim
// emission — both elements are kept as written, and the providers survive.
export class SpreadWithMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SpreadWithMwpModule, never> =
    function SpreadWithMwpModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || SpreadWithMwpModule)();
    };
  // @ts-ignore
  static ɵmod: SpreadWithMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: SpreadWithMwpModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SpreadWithMwpModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [...LOCAL_ALIAS, SharedModule.forRoot()],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SpreadWithMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [...LOCAL_ALIAS, SharedModule.forRoot()],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(SpreadWithMwpModule, {
      imports: [...LOCAL_ALIAS, SharedModule.forRoot()],
    });
})();

// A non-array `imports` value is a single top-level element covering the whole expression.
export class NonArrayModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NonArrayModule, never> = function NonArrayModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NonArrayModule)();
  };
  // @ts-ignore
  static ɵmod: NonArrayModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NonArrayModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NonArrayModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [LOCAL_ALIAS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NonArrayModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: LOCAL_ALIAS,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(NonArrayModule, { imports: LOCAL_ALIAS });
})();

// An alias whose members do not all survive filtering loses its verbatim emission: the
// surviving references are emitted individually, as ngtsc cannot filter inside the alias.
export class FilteredAliasModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FilteredAliasModule, never> =
    function FilteredAliasModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FilteredAliasModule)();
    };
  // @ts-ignore
  static ɵmod: FilteredAliasModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: FilteredAliasModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FilteredAliasModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MIXED_ALIAS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FilteredAliasModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [MIXED_ALIAS],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(FilteredAliasModule, { imports: [MIXED_ALIAS] });
})();

// The filtered alias contributes one reference, so the `ModuleWithProviders` that follows
// has to land at index 1 rather than being appended at the end.
export class FilteredAliasBeforeMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FilteredAliasBeforeMwpModule, never> =
    function FilteredAliasBeforeMwpModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FilteredAliasBeforeMwpModule)();
    };
  // @ts-ignore
  static ɵmod: FilteredAliasBeforeMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: FilteredAliasBeforeMwpModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FilteredAliasBeforeMwpModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({
      imports: [MIXED_ALIAS, SharedModule.forRoot(), OtherModule],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FilteredAliasBeforeMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [MIXED_ALIAS, SharedModule.forRoot(), OtherModule],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(FilteredAliasBeforeMwpModule, {
      imports: [MIXED_ALIAS, SharedModule.forRoot(), OtherModule],
    });
})();

// A spread of an alias with a filtered member is likewise expanded to survivors only.
export class FilteredSpreadBeforeMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FilteredSpreadBeforeMwpModule, never> =
    function FilteredSpreadBeforeMwpModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || FilteredSpreadBeforeMwpModule)();
    };
  // @ts-ignore
  static ɵmod: FilteredSpreadBeforeMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: FilteredSpreadBeforeMwpModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FilteredSpreadBeforeMwpModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [...MIXED_ALIAS, SharedModule.forRoot()] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FilteredSpreadBeforeMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [...MIXED_ALIAS, SharedModule.forRoot()],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(FilteredSpreadBeforeMwpModule, {
      imports: [...MIXED_ALIAS, SharedModule.forRoot()],
    });
})();

// `forwardRef` is emitted as written — the reference it resolves to is only used to decide
// whether the element survives filtering.
export class ForwardRefModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ForwardRefModule, never> = function ForwardRefModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ForwardRefModule)();
  };
  // @ts-ignore
  static ɵmod: ForwardRefModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ForwardRefModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ForwardRefModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [forwardRef(() => OtherModule)],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ForwardRefModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [forwardRef(() => OtherModule)],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ForwardRefModule, { imports: [forwardRef(() => OtherModule)] });
})();

// Type-only syntax is erased by ngtsc's printer, so the re-printed source must skip it to land
// on the same text.
export class TypeAssertionModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TypeAssertionModule, never> =
    function TypeAssertionModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || TypeAssertionModule)();
    };
  // @ts-ignore
  static ɵmod: TypeAssertionModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: TypeAssertionModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TypeAssertionModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TypeAssertionModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule as any, OtherModule as any],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(TypeAssertionModule, {
      imports: [SharedModule as any, OtherModule as any],
    });
})();

// An object literal is a `ModuleWithProviders` to ngtsc purely by having an `ngModule` key, so
// it is kept verbatim whatever that key holds. Testing the key's value instead would be a
// counting bug as well as a parity one: this element lowers to two references, so treating it
// as one filtered entry would splice the `forRoot()` below it into the middle of the pair.
export class ObjectLiteralNgModuleArrayModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ObjectLiteralNgModuleArrayModule, never> =
    function ObjectLiteralNgModuleArrayModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ObjectLiteralNgModuleArrayModule)();
    };
  // @ts-ignore
  static ɵmod: ObjectLiteralNgModuleArrayModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ObjectLiteralNgModuleArrayModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ObjectLiteralNgModuleArrayModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({
      imports: [{ ngModule: [SharedModule, OtherModule] }, SharedModule.forRoot()],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ObjectLiteralNgModuleArrayModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [{ ngModule: [SharedModule, OtherModule] } as any, SharedModule.forRoot()],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(ObjectLiteralNgModuleArrayModule, {
      imports: [{ ngModule: [SharedModule, OtherModule] } as any, SharedModule.forRoot()],
    });
})();

// Nesting is preserved when everything survives, and flattened to survivors when it does not —
// at any depth, and without disturbing the index of a verbatim element that follows.
export class DeepNestedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeepNestedModule, never> = function DeepNestedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DeepNestedModule)();
  };
  // @ts-ignore
  static ɵmod: DeepNestedModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DeepNestedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DeepNestedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [
      [SharedModule, [OtherModule]],
      [[StandaloneDir, SharedModule]],
      SharedModule.forRoot(),
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeepNestedModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [
                  [SharedModule, [OtherModule]],
                  [[StandaloneDir, SharedModule]],
                  SharedModule.forRoot(),
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(DeepNestedModule, {
      imports: [
        [SharedModule, [OtherModule]],
        [[StandaloneDir, SharedModule]],
        SharedModule.forRoot(),
      ],
    });
})();

```

# /out/shared.ts
```ts
import { Directive, ModuleWithProviders, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandaloneDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never> = function StandaloneDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    StandaloneDir,
    '[sdir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: StandaloneDir, selectors: [['', 'sdir', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandaloneDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[sdir]',
                standalone: true,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return { ngModule: SharedModule, providers: [] };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: SharedModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(SharedModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export class OtherModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<OtherModule, never> = function OtherModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || OtherModule)();
  };
  // @ts-ignore
  static ɵmod: OtherModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: OtherModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<OtherModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(OtherModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

export const EXTERNAL_ALIAS = [SharedModule, OtherModule];

export const USE_SHARED = true;

```