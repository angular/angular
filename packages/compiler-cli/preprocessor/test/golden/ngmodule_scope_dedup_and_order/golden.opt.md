# /out/app.ngtypecheck.ts
```ts
/**
 * TCB for /app.ts
 * @generated
 */

import * as i0 from './app';

/*tcb1*/
function _tcb1(this: i0.AppComp) {
  if (true) {
  }
}

```

# /out/app.ts
```ts
import { Component, NgModule } from '@angular/core';
import { ModuleA, ModuleB } from './shared';
import { ReexportModule } from './reexport';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './shared';
// @ts-ignore
import * as i2 from './reexport';

export class AppComp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppComp, never> = function AppComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    AppComp,
    'app-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: AppComp,
      selectors: [['app-comp']],
      standalone: false,
      decls: 1,
      vars: 0,
      consts: [['dirX', '', 'dirB', '', 'internalDir', '']],
      template: function AppComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelement(0, 'div', 0);
        }
      },
      dependencies: [i1.DirX, i1.DirB, i2.PublicDir],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-comp',
                template: '<div dirX dirB internalDir></div>',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(AppComp, { className: 'AppComp', filePath: 'app.ts', lineNumber: 10 });
})();

export class AppModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AppModule, never> = function AppModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AppModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    AppModule,
    [typeof AppComp],
    [typeof ModuleA, typeof ModuleB, typeof ReexportModule],
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [ModuleA, ModuleB, ReexportModule] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [AppComp],
                imports: [ModuleA, ModuleB, ReexportModule],
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
    i0.ɵɵsetNgModuleScope(AppModule, {
      declarations: [AppComp],
      imports: [ModuleA, ModuleB, ReexportModule],
    });
})();

```

# /out/reexport.ts
```ts
import { Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './reexport';

class InternalDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InternalDir, never> = function InternalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InternalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    InternalDir,
    '[internalDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: InternalDir,
      selectors: [['', 'internalDir', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InternalDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[internalDir]',
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

export class ReexportModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ReexportModule, never> = function ReexportModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ReexportModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    ReexportModule,
    [typeof i1.PublicDir],
    never,
    [typeof i1.PublicDir]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ReexportModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ReexportModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ReexportModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [InternalDir],
                exports: [InternalDir],
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
    i0.ɵɵsetNgModuleScope(ReexportModule, { declarations: [InternalDir], exports: [InternalDir] });
})();

export { InternalDir as PublicDir };

```

# /out/shared.ts
```ts
import { Directive, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DirX {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirX, never> = function DirX_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirX)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirX,
    '[dirX]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: DirX,
      selectors: [['', 'dirX', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirX,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirX]',
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

export class DirB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DirB, never> = function DirB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || DirB)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    DirB,
    '[dirB]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: DirB,
      selectors: [['', 'dirB', '']],
      standalone: false,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DirB,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[dirB]',
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

export class ModuleA {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleA, never> = function ModuleA_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleA)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    ModuleA,
    [typeof DirX, typeof DirB],
    never,
    [typeof DirX, typeof DirB]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModuleA });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModuleA> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleA,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [DirX, DirB],
                exports: [DirX, DirB],
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
    i0.ɵɵsetNgModuleScope(ModuleA, { declarations: [DirX, DirB], exports: [DirX, DirB] });
})();

export class ModuleB {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ModuleB, never> = function ModuleB_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ModuleB)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ModuleB, never, [typeof ModuleA], [typeof DirX]> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ModuleB });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ModuleB> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [ModuleA] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ModuleB,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [ModuleA],
                exports: [DirX],
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
    i0.ɵɵsetNgModuleScope(ModuleB, { imports: [ModuleA], exports: [DirX] });
})();

```