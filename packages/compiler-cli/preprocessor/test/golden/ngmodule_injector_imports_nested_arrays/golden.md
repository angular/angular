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

// A nested array with a filtered entry: ngtsc flattens the element's references and
// emits only the survivors, so the inner array does not reach the output.
export class NestedFilteredModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedFilteredModule, never> =
    function NestedFilteredModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedFilteredModule)();
    };
  // @ts-ignore
  static ɵmod: NestedFilteredModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NestedFilteredModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedFilteredModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule, StandaloneDir, SharedModule]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedFilteredModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[SharedModule, StandaloneDir, SharedModule]],
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
    i0.ɵɵsetNgModuleScope(NestedFilteredModule, {
      imports: [[SharedModule, StandaloneDir, SharedModule]],
    });
})();

// A nested array whose references all survive is emitted verbatim, nesting included.
export class NestedAllKeptModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedAllKeptModule, never> =
    function NestedAllKeptModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedAllKeptModule)();
    };
  // @ts-ignore
  static ɵmod: NestedAllKeptModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NestedAllKeptModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedAllKeptModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule, OtherModule]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedAllKeptModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[SharedModule, OtherModule]],
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
    i0.ɵɵsetNgModuleScope(NestedAllKeptModule, { imports: [[SharedModule, OtherModule]] });
})();

// Nested arrays in `exports` are flattened by `resolveTypeList` before the exported
// NgModules are appended to the injector imports.
export class NestedExportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedExportsModule, never> =
    function NestedExportsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedExportsModule)();
    };
  // @ts-ignore
  static ɵmod: NestedExportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NestedExportsModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedExportsModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule, OtherModule]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedExportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [[SharedModule, OtherModule]],
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
    i0.ɵɵsetNgModuleScope(NestedExportsModule, { exports: [[SharedModule, OtherModule]] });
})();

// Mixed nesting depth: the first element is kept verbatim, the second is flattened
// because it contains a filtered entry.
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
    imports: [SharedModule, [OtherModule, [StandaloneDir, SharedModule]]],
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
                imports: [SharedModule, [OtherModule, [StandaloneDir, SharedModule]]],
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
      imports: [SharedModule, [OtherModule, [StandaloneDir, SharedModule]]],
    });
})();

// A ModuleWithProviders anywhere inside a nested array forces the whole element to be
// emitted verbatim, even though the array also contains a filtered directive.
export class NestedMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedMwpModule, never> = function NestedMwpModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NestedMwpModule)();
  };
  // @ts-ignore
  static ɵmod: NestedMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NestedMwpModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedMwpModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule.forRoot(), StandaloneDir]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[SharedModule.forRoot(), StandaloneDir]],
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
    i0.ɵɵsetNgModuleScope(NestedMwpModule, { imports: [[SharedModule.forRoot(), StandaloneDir]] });
})();

// Nested `exports` are flattened at any depth, and a module reached twice is appended twice.
export class DeepNestedExportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeepNestedExportsModule, never> =
    function DeepNestedExportsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DeepNestedExportsModule)();
    };
  // @ts-ignore
  static ɵmod: DeepNestedExportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: DeepNestedExportsModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DeepNestedExportsModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SharedModule, [OtherModule, [SharedModule]]] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeepNestedExportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [SharedModule, [OtherModule, [SharedModule]]],
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
    i0.ɵɵsetNgModuleScope(DeepNestedExportsModule, {
      exports: [SharedModule, [OtherModule, [SharedModule]]],
    });
})();

// Nesting on both fields at once: import-derived entries come first, then export-derived ones.
export class NestedBothModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedBothModule, never> = function NestedBothModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NestedBothModule)();
  };
  // @ts-ignore
  static ɵmod: NestedBothModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NestedBothModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedBothModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[StandaloneDir, SharedModule], [OtherModule]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedBothModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[StandaloneDir, SharedModule]],
                exports: [[OtherModule]],
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
    i0.ɵɵsetNgModuleScope(NestedBothModule, {
      imports: [[StandaloneDir, SharedModule]],
      exports: [[OtherModule]],
    });
})();

// An empty nested array has no references to filter, so it stays verbatim.
export class EmptyNestedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptyNestedModule, never> =
    function EmptyNestedModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || EmptyNestedModule)();
    };
  // @ts-ignore
  static ɵmod: EmptyNestedModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: EmptyNestedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<EmptyNestedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EmptyNestedModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[]],
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
    i0.ɵɵsetNgModuleScope(EmptyNestedModule, { imports: [[]] });
})();

// Every reference in the nested array is filtered out, so nothing is emitted at all.
export class AllFilteredNestedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AllFilteredNestedModule, never> =
    function AllFilteredNestedModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || AllFilteredNestedModule)();
    };
  // @ts-ignore
  static ɵmod: AllFilteredNestedModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: AllFilteredNestedModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AllFilteredNestedModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[StandaloneDir]] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AllFilteredNestedModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[StandaloneDir]],
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
    i0.ɵɵsetNgModuleScope(AllFilteredNestedModule, { imports: [[StandaloneDir]] });
})();

// A flattened nested element ahead of a verbatim ModuleWithProviders element: the MWP has
// to land at index 2, after the two references the nested element contributed.
export class NestedBeforeMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedBeforeMwpModule, never> =
    function NestedBeforeMwpModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedBeforeMwpModule)();
    };
  // @ts-ignore
  static ɵmod: NestedBeforeMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NestedBeforeMwpModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedBeforeMwpModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[SharedModule, StandaloneDir, SharedModule], SharedModule.forRoot(), OtherModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedBeforeMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [
                  [SharedModule, StandaloneDir, SharedModule],
                  SharedModule.forRoot(),
                  OtherModule,
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
    i0.ɵɵsetNgModuleScope(NestedBeforeMwpModule, {
      imports: [[SharedModule, StandaloneDir, SharedModule], SharedModule.forRoot(), OtherModule],
    });
})();

// A nested element that contributes no surviving reference must not shift the position of
// the verbatim ModuleWithProviders element that follows it.
export class EmptyNestedBeforeMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptyNestedBeforeMwpModule, never> =
    function EmptyNestedBeforeMwpModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || EmptyNestedBeforeMwpModule)();
    };
  // @ts-ignore
  static ɵmod: EmptyNestedBeforeMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: EmptyNestedBeforeMwpModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<EmptyNestedBeforeMwpModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[StandaloneDir], SharedModule.forRoot()] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EmptyNestedBeforeMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[StandaloneDir], SharedModule.forRoot()],
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
    i0.ɵɵsetNgModuleScope(EmptyNestedBeforeMwpModule, {
      imports: [[StandaloneDir], SharedModule.forRoot()],
    });
})();

// The filtering half of the nested `exports` walk: a directive nested in `exports` is not
// an NgModule and so contributes nothing to the injector imports.
export class NestedExportsFilteredModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NestedExportsFilteredModule, never> =
    function NestedExportsFilteredModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || NestedExportsFilteredModule)();
    };
  // @ts-ignore
  static ɵmod: NestedExportsFilteredModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: NestedExportsFilteredModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NestedExportsFilteredModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SharedModule, [Dir, OtherModule]] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NestedExportsFilteredModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [SharedModule],
                exports: [[Dir, OtherModule]],
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
    i0.ɵɵsetNgModuleScope(NestedExportsFilteredModule, {
      imports: [SharedModule],
      exports: [[Dir, OtherModule]],
    });
})();

// A ModuleWithProviders two levels down still forces the whole top-level element verbatim.
export class DeepMwpModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DeepMwpModule, never> = function DeepMwpModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DeepMwpModule)();
  };
  // @ts-ignore
  static ɵmod: DeepMwpModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DeepMwpModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DeepMwpModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [[[SharedModule.forRoot()]]],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DeepMwpModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[[SharedModule.forRoot()]]],
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
    i0.ɵɵsetNgModuleScope(DeepMwpModule, { imports: [[[SharedModule.forRoot()]]] });
})();

// The innermost array is filtered away entirely while its siblings survive.
export class InnerAllFilteredModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InnerAllFilteredModule, never> =
    function InnerAllFilteredModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || InnerAllFilteredModule)();
    };
  // @ts-ignore
  static ɵmod: InnerAllFilteredModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: InnerAllFilteredModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<InnerAllFilteredModule> = /*@__PURE__*/ i0.ɵɵdefineInjector(
    { imports: [[SharedModule, [StandaloneDir]]] },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InnerAllFilteredModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[SharedModule, [StandaloneDir]]],
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
    i0.ɵɵsetNgModuleScope(InnerAllFilteredModule, { imports: [[SharedModule, [StandaloneDir]]] });
})();

// Base case of the `exports` recursion.
export class EmptyNestedExportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptyNestedExportsModule, never> =
    function EmptyNestedExportsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || EmptyNestedExportsModule)();
    };
  // @ts-ignore
  static ɵmod: EmptyNestedExportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: EmptyNestedExportsModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<EmptyNestedExportsModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[]] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        EmptyNestedExportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                exports: [[]],
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
    i0.ɵɵsetNgModuleScope(EmptyNestedExportsModule, { exports: [[]] });
})();

// A verbatim (all-kept) nested `imports` element alongside a flattened nested `exports`.
export class VerbatimImportsNestedExportsModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<VerbatimImportsNestedExportsModule, never> =
    function VerbatimImportsNestedExportsModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || VerbatimImportsNestedExportsModule)();
    };
  // @ts-ignore
  static ɵmod: VerbatimImportsNestedExportsModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({
    type: VerbatimImportsNestedExportsModule,
  });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<VerbatimImportsNestedExportsModule> =
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [[SharedModule, OtherModule], [OtherModule]] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        VerbatimImportsNestedExportsModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [[SharedModule, OtherModule]],
                exports: [[OtherModule]],
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
    i0.ɵɵsetNgModuleScope(VerbatimImportsNestedExportsModule, {
      imports: [[SharedModule, OtherModule]],
      exports: [[OtherModule]],
    });
})();

```