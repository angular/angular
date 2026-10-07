# /out/app.module.ngtypecheck.ts
```ts
/**
 * TCB for /app.module.ts
 * @generated
 */

import * as i0 from './app.module';

/*tcb1*/
function _tcb1(this: i0.CmpNoProv) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.CmpProv) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.CmpTrans) {
  if (true) {
  }
}

/*tcb4*/
function _tcb4(this: i0.CmpPlain) {
  if (true) {
  }
}

```

# /out/app.module.ts
```ts
import { NgModule, Component } from '@angular/core';
import { NoProvModule, ProvModule, TransitiveModule, PlainModule, SaDir, SaPipe } from './lib';
// @ts-ignore
import * as i0 from '@angular/core';

export class CmpNoProv {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpNoProv, never> = function CmpNoProv_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpNoProv)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpNoProv,
    'c1',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpNoProv,
    selectors: [['c1']],
    decls: 0,
    vars: 0,
    template: function CmpNoProv_Template(rf: number, ctx: any): any {},
    dependencies: [NoProvModule],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpNoProv,
        [{ type: Component, args: [{ selector: 'c1', template: '', imports: [NoProvModule] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpNoProv, {
      className: 'CmpNoProv',
      filePath: 'app.module.ts',
      lineNumber: 5,
    });
})();

export class CmpProv {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpProv, never> = function CmpProv_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpProv)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<CmpProv, 'c2', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CmpProv,
      selectors: [['c2']],
      decls: 0,
      vars: 0,
      template: function CmpProv_Template(rf: number, ctx: any): any {},
      dependencies: [ProvModule],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpProv,
        [{ type: Component, args: [{ selector: 'c2', template: '', imports: [ProvModule] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpProv, {
      className: 'CmpProv',
      filePath: 'app.module.ts',
      lineNumber: 8,
    });
})();

export class CmpTrans {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpTrans, never> = function CmpTrans_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpTrans)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<CmpTrans, 'c3', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CmpTrans,
      selectors: [['c3']],
      decls: 0,
      vars: 0,
      template: function CmpTrans_Template(rf: number, ctx: any): any {},
      dependencies: [TransitiveModule],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpTrans,
        [
          {
            type: Component,
            args: [{ selector: 'c3', template: '', imports: [TransitiveModule] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpTrans, {
      className: 'CmpTrans',
      filePath: 'app.module.ts',
      lineNumber: 11,
    });
})();

export class CmpPlain {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpPlain, never> = function CmpPlain_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpPlain)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<CmpPlain, 'c4', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: CmpPlain,
      selectors: [['c4']],
      decls: 0,
      vars: 0,
      template: function CmpPlain_Template(rf: number, ctx: any): any {},
      dependencies: [PlainModule],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpPlain,
        [{ type: Component, args: [{ selector: 'c4', template: '', imports: [PlainModule] }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpPlain, {
      className: 'CmpPlain',
      filePath: 'app.module.ts',
      lineNumber: 14,
    });
})();

// `ɵinj.imports` keeps a standalone component only when it may export providers, drops
// directives and pipes outright, and keeps an NgModule unconditionally — whether or not that
// module declares providers of its own.
//
// Verified against ngc 22.1.0-next.6:
//   imports: [CmpProv, CmpTrans, PlainModule]
//
// `CmpNoProv` and `CmpPlain` are dropped because the modules they import carry no providers,
// transitively. `CmpTrans` survives through `TransitiveModule` -> `ProvModule`. `PlainModule`
// survives despite declaring no providers, because the provider question is asked only of
// components.
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
    never,
    [
      typeof CmpNoProv,
      typeof CmpProv,
      typeof CmpTrans,
      typeof CmpPlain,
      typeof PlainModule,
      typeof SaDir,
      typeof SaPipe,
    ],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [CmpProv, CmpTrans, PlainModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [CmpNoProv, CmpProv, CmpTrans, CmpPlain, PlainModule, SaDir, SaPipe],
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
      imports: [CmpNoProv, CmpProv, CmpTrans, CmpPlain, PlainModule, SaDir, SaPipe],
    });
})();

```

# /out/lib.ts
```ts
import { NgModule, Directive, Component, Injectable, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Svc {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Svc, never> = function Svc_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Svc)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Svc,
    factory: Svc.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Svc, [{ type: Injectable }], null, null);
  }
}

export class SaDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SaDir, never> = function SaDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SaDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<SaDir, '[sa]', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineDirective({ type: SaDir, selectors: [['', 'sa', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SaDir,
        [{ type: Directive, args: [{ selector: '[sa]', standalone: true }] }],
        null,
        null,
      );
  }
}

export class SaPipe {
  transform(v: unknown) {
    return v;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SaPipe, never> = function SaPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SaPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<SaPipe, 'sp', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'sp',
    type: SaPipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SaPipe,
        [{ type: Pipe, args: [{ name: 'sp', standalone: true }] }],
        null,
        null,
      );
  }
}

// Declares nothing and imports nothing that carries providers.
export class NoProvModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NoProvModule, never> = function NoProvModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NoProvModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<NoProvModule, never, [typeof SaDir], [typeof SaDir]> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: NoProvModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<NoProvModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NoProvModule,
        [{ type: NgModule, args: [{ imports: [SaDir], exports: [SaDir] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(NoProvModule, { imports: [SaDir], exports: [SaDir] });
})();

export class ProvModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ProvModule, never> = function ProvModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ProvModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ProvModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ProvModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ProvModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [Svc],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ProvModule,
        [{ type: NgModule, args: [{ providers: [Svc] }] }],
        null,
        null,
      );
  }
}

// Carries providers only through its own imports.
export class TransitiveModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TransitiveModule, never> = function TransitiveModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TransitiveModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<TransitiveModule, never, [typeof ProvModule], never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TransitiveModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TransitiveModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [ProvModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TransitiveModule,
        [{ type: NgModule, args: [{ imports: [ProvModule] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(TransitiveModule, { imports: [ProvModule] });
})();

export class PlainModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PlainModule, never> = function PlainModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PlainModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<PlainModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: PlainModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<PlainModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(PlainModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```