# /out/app.module.ts
```ts
import { Directive, ModuleWithProviders, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

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

export class DupImportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DupImportsModule, never> = function DupImportsModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DupImportsModule)();
  };
  // @ts-ignore
  static ɵmod: DupImportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DupImportsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DupImportsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DupImportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule, SharedModule],
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
    i0.ɵɵsetNgModuleScope(DupImportsModule, { imports: [SharedModule, SharedModule] });
})();

export class ImportAndExportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ImportAndExportModule, never> =
    function ImportAndExportModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || ImportAndExportModule)();
    };
  // @ts-ignore
  static ɵmod: ImportAndExportModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: ImportAndExportModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ImportAndExportModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ImportAndExportModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule],
                exports: [SharedModule],
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
    i0.ɵɵsetNgModuleScope(ImportAndExportModule, {
      imports: [SharedModule],
      exports: [SharedModule],
    });
})();

export class DupExportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DupExportsModule, never> = function DupExportsModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DupExportsModule)();
  };
  // @ts-ignore
  static ɵmod: DupExportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DupExportsModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DupExportsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DupExportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [SharedModule, SharedModule],
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
    i0.ɵɵsetNgModuleScope(DupExportsModule, { exports: [SharedModule, SharedModule] });
})();

export class DupBothModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DupBothModule, never> = function DupBothModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DupBothModule)();
  };
  // @ts-ignore
  static ɵmod: DupBothModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DupBothModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DupBothModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule, OtherModule, SharedModule, OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DupBothModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule, SharedModule, OtherModule],
                exports: [SharedModule, OtherModule],
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
    i0.ɵɵsetNgModuleScope(DupBothModule, {
      imports: [SharedModule, SharedModule, OtherModule],
      exports: [SharedModule, OtherModule],
    });
})();

export class NestedVerbatimModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedVerbatimModule, never> =
    function NestedVerbatimModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedVerbatimModule)();
    };
  // @ts-ignore
  static ɵmod: NestedVerbatimModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NestedVerbatimModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedVerbatimModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule, SharedModule], SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedVerbatimModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[SharedModule, SharedModule]],
                exports: [SharedModule],
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
    i0.ɵɵsetNgModuleScope(NestedVerbatimModule, {
      imports: [[SharedModule, SharedModule]],
      exports: [SharedModule],
    });
})();

export class DupMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DupMwpModule, never> = function DupMwpModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DupMwpModule)();
  };
  // @ts-ignore
  static ɵmod: DupMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DupMwpModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DupMwpModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule.forRoot(), SharedModule.forRoot()],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DupMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule.forRoot(), SharedModule.forRoot()],
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
    i0.ɵɵsetNgModuleScope(DupMwpModule, {
      imports: [SharedModule.forRoot(), SharedModule.forRoot()],
    });
})();

// A duplicate reference ahead of a verbatim (ModuleWithProviders) element must still
// advance the position of that element in the emitted list.
export class DupBeforeMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DupBeforeMwpModule, never> =
    function DupBeforeMwpModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DupBeforeMwpModule)();
    };
  // @ts-ignore
  static ɵmod: DupBeforeMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DupBeforeMwpModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DupBeforeMwpModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule, SharedModule.forRoot(), OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DupBeforeMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule, SharedModule, SharedModule.forRoot(), OtherModule],
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
    i0.ɵɵsetNgModuleScope(DupBeforeMwpModule, {
      imports: [SharedModule, SharedModule, SharedModule.forRoot(), OtherModule],
    });
})();

```