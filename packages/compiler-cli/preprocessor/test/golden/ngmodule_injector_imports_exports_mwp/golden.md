# /out/app.module.ts
```ts
import { Directive, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { DtsModule } from './dts-module';
import { CROSS_FILE_MWP } from './cross-file';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedService, never> = function SharedService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: SharedService,
    factory: SharedService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(SharedService, [{ type: Injectable }], null, null);
  }
}

export class Dir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dir, never> = function Dir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<Dir, '[dir]', never, {}, {}, never, never, false, never> =
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: Dir,
      selectors: [['', 'dir', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Dir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

// `SharedService` is what a dropped `SharedModule` entry costs at runtime: the injector never
// reaches this module's own `providers`. (The `providers` passed to `forRoot()` are discarded
// by ngtsc on the `exports` path either way — only the module itself carries over.)
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
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [SharedService],
    imports: [Dir],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [Dir],
                exports: [Dir],
                providers: [SharedService],
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
    i0.ɵɵsetNgModuleScope(SharedModule, { declarations: [Dir], exports: [Dir] });
})();

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

// A `ModuleWithProviders` reaching `exports` is unwrapped to its `ngModule`, so
// `SharedModule` still lands in the injector imports.
export class MwpExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpExportModule, never> = function MwpExportModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MwpExportModule)();
  };
  // @ts-ignore
  static ɵmod: MwpExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MwpExportModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpExportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule.forRoot()],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [SharedModule.forRoot() as any],
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
    i0.ɵɵsetNgModuleScope(MwpExportModule, { exports: [SharedModule.forRoot() as any] });
})();

// Reached through an identifier rather than syntactically.
const SHARED_WITH_PROVIDERS = SharedModule.forRoot();

export class MwpAliasExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpAliasExportModule, never> =
    function MwpAliasExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpAliasExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpAliasExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpAliasExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpAliasExportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SHARED_WITH_PROVIDERS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpAliasExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [SHARED_WITH_PROVIDERS as any],
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
    i0.ɵɵsetNgModuleScope(MwpAliasExportModule, { exports: [SHARED_WITH_PROVIDERS as any] });
})();

// The same, but resolved across a file boundary, so the reference is emitted through the
// import manager rather than as a local identifier.
export class MwpCrossFileExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpCrossFileExportModule, never> =
    function MwpCrossFileExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpCrossFileExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpCrossFileExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpCrossFileExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpCrossFileExportModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [CROSS_FILE_MWP] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpCrossFileExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [CROSS_FILE_MWP as any],
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
    i0.ɵɵsetNgModuleScope(MwpCrossFileExportModule, { exports: [CROSS_FILE_MWP as any] });
})();

// Nested inside an array in `exports` (the only spelling that type-checks as written).
export class MwpNestedExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpNestedExportModule, never> =
    function MwpNestedExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpNestedExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpNestedExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpNestedExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpNestedExportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule.forRoot()]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpNestedExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [[SharedModule.forRoot()]],
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
    i0.ɵɵsetNgModuleScope(MwpNestedExportModule, { exports: [[SharedModule.forRoot()]] });
})();

// The unwrapped module keeps its source position relative to the other exports.
export class MwpExportOrderModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpExportOrderModule, never> =
    function MwpExportOrderModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpExportOrderModule)();
    };
  // @ts-ignore
  static ɵmod: MwpExportOrderModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpExportOrderModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpExportOrderModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [OtherModule, SharedModule.forRoot(), OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpExportOrderModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [OtherModule, SharedModule.forRoot() as any, OtherModule],
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
    i0.ɵɵsetNgModuleScope(MwpExportOrderModule, {
      exports: [OtherModule, SharedModule.forRoot() as any, OtherModule],
    });
})();

// Export-derived entries still follow the ones contributed by `imports`.
export class MwpImportAndExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpImportAndExportModule, never> =
    function MwpImportAndExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpImportAndExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpImportAndExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpImportAndExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpImportAndExportModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [OtherModule, SharedModule.forRoot()] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpImportAndExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [OtherModule],
                exports: [SharedModule.forRoot() as any],
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
    i0.ɵɵsetNgModuleScope(MwpImportAndExportModule, {
      imports: [OtherModule],
      exports: [SharedModule.forRoot() as any],
    });
})();

// A bare object literal of the `ModuleWithProviders` shape is unwrapped the same way.
export class MwpLiteralExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpLiteralExportModule, never> =
    function MwpLiteralExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpLiteralExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpLiteralExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpLiteralExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpLiteralExportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector(
    { imports: [{ ngModule: SharedModule, providers: [] }] },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpLiteralExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [{ ngModule: SharedModule, providers: [] } as any],
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
    i0.ɵɵsetNgModuleScope(MwpLiteralExportModule, {
      exports: [{ ngModule: SharedModule, providers: [] } as any],
    });
})();

// Unwrapping happens before nested arrays are flattened, so an `ngModule` that is itself an
// array contributes every module in it.
export class MwpArrayNgModuleExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpArrayNgModuleExportModule, never> =
    function MwpArrayNgModuleExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpArrayNgModuleExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpArrayNgModuleExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpArrayNgModuleExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpArrayNgModuleExportModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({
      imports: [{ ngModule: [SharedModule, OtherModule], providers: [] }],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpArrayNgModuleExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [{ ngModule: [SharedModule, OtherModule], providers: [] } as any],
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
    i0.ɵɵsetNgModuleScope(MwpArrayNgModuleExportModule, {
      exports: [{ ngModule: [SharedModule, OtherModule], providers: [] } as any],
    });
})();

// The declaration-file form, which the `ModuleWithProviders<T>` return-type recognizer
// resolves rather than the evaluator descending into a function body.
export class MwpDtsExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpDtsExportModule, never> =
    function MwpDtsExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpDtsExportModule)();
    };
  // @ts-ignore
  static ɵmod: MwpDtsExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MwpDtsExportModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpDtsExportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [DtsModule.forRoot()],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpDtsExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [DtsModule.forRoot() as any],
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
    i0.ɵɵsetNgModuleScope(MwpDtsExportModule, { exports: [DtsModule.forRoot() as any] });
})();

// `ModuleWithProviders` in `imports` is unaffected: that element is kept verbatim.
export class MwpImportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpImportModule, never> = function MwpImportModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MwpImportModule)();
  };
  // @ts-ignore
  static ɵmod: MwpImportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MwpImportModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpImportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule.forRoot(), OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpImportModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule.forRoot()],
                exports: [OtherModule],
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
    i0.ɵɵsetNgModuleScope(MwpImportModule, {
      imports: [SharedModule.forRoot()],
      exports: [OtherModule],
    });
})();

// A verbatim (`ModuleWithProviders`) `imports` element in last position must keep its index
// once `exports` starts appending entries behind it.
export class MwpTrailingVerbatimModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpTrailingVerbatimModule, never> =
    function MwpTrailingVerbatimModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpTrailingVerbatimModule)();
    };
  // @ts-ignore
  static ɵmod: MwpTrailingVerbatimModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpTrailingVerbatimModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpTrailingVerbatimModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({
      imports: [OtherModule, SharedModule.forRoot(), SharedModule.forRoot()],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpTrailingVerbatimModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [OtherModule, SharedModule.forRoot()],
                exports: [SharedModule.forRoot() as any],
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
    i0.ɵɵsetNgModuleScope(MwpTrailingVerbatimModule, {
      imports: [OtherModule, SharedModule.forRoot()],
      exports: [SharedModule.forRoot() as any],
    });
})();

// The same, with a re-printed nested array ahead of the verbatim element so that both
// verbatim spans must land before the export-derived entry.
export class MwpNestedThenVerbatimModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MwpNestedThenVerbatimModule, never> =
    function MwpNestedThenVerbatimModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MwpNestedThenVerbatimModule)();
    };
  // @ts-ignore
  static ɵmod: MwpNestedThenVerbatimModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: MwpNestedThenVerbatimModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MwpNestedThenVerbatimModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({
      imports: [[OtherModule, OtherModule], SharedModule.forRoot(), SharedModule.forRoot()],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MwpNestedThenVerbatimModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[OtherModule, OtherModule], SharedModule.forRoot()],
                exports: [SharedModule.forRoot() as any],
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
    i0.ɵɵsetNgModuleScope(MwpNestedThenVerbatimModule, {
      imports: [[OtherModule, OtherModule], SharedModule.forRoot()],
      exports: [SharedModule.forRoot() as any],
    });
})();

```

# /out/cross-file.ts
```ts
import { Directive, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class CrossService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CrossService, never> = function CrossService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CrossService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: CrossService,
    factory: CrossService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(CrossService, [{ type: Injectable }], null, null);
  }
}

export class CrossDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CrossDir, never> = function CrossDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CrossDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CrossDir,
    '[crossDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: CrossDir,
    selectors: [['', 'crossDir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CrossDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[crossDir]',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class CrossModule {
  static forRoot(): ModuleWithProviders<CrossModule> {
    return { ngModule: CrossModule, providers: [] };
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CrossModule, never> = function CrossModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CrossModule)();
  };
  // @ts-ignore
  static ɵmod: CrossModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: CrossModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<CrossModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [CrossService],
    imports: [CrossDir],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CrossModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [CrossDir],
                exports: [CrossDir],
                providers: [CrossService],
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
    i0.ɵɵsetNgModuleScope(CrossModule, { declarations: [CrossDir], exports: [CrossDir] });
})();

export const CROSS_FILE_MWP = CrossModule.forRoot();

```

# /out/dts-module.d.ts
```ts
import * as i0 from '@angular/core';
import { ModuleWithProviders } from '@angular/core';

export declare class DtsModule {
  static forRoot(): ModuleWithProviders<DtsModule>;
  static ɵfac: i0.ɵɵFactoryDeclaration<DtsModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<DtsModule, never, never, never>;
  static ɵinj: i0.ɵɵInjectorDeclaration<DtsModule>;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DtsModule, never> = function DtsModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DtsModule)();
  };
  // @ts-ignore
  static ɵmod: DtsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DtsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DtsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DtsModule, [{ type: NgModule }], null, null);
  }
}

```