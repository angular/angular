# /out/app.module.ngtypecheck.ts
```ts
/**
 * TCB for /app.module.ts
 * @generated
 */

import * as i0 from './app.module';

/*tcb1*/
function _tcb1(this: i0.CmpLocalArray) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.CmpSpread) {
  if (true) {
  }
}

/*tcb3*/
function _tcb3(this: i0.CmpNested) {
  if (true) {
  }
}

/*tcb4*/
function _tcb4(this: i0.CmpNoProv) {
  if (true) {
  }
}

/*tcb5*/
function _tcb5(this: i0.CmpLocalTransitive) {
  if (true) {
  }
}

```

# /out/app.module.ts
```ts
import { NgModule, Component } from '@angular/core';
import { NoProvModule, ProvModule, SaDir } from './lib';
// @ts-ignore
import * as i0 from '@angular/core';

const NG_COMPONENT_IMPORTS = [NoProvModule, ProvModule];
const NO_PROVIDER_IMPORTS = [NoProvModule, SaDir];
const NESTED_IMPORTS = [[SaDir], ...NG_COMPONENT_IMPORTS];
const MODULE_IMPORTS = [ProvModule];

export class LocalTransitiveModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<LocalTransitiveModule, never> =
    function LocalTransitiveModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || LocalTransitiveModule)();
    };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<LocalTransitiveModule, never, [typeof ProvModule], never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: LocalTransitiveModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<LocalTransitiveModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [MODULE_IMPORTS],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        LocalTransitiveModule,
        [{ type: NgModule, args: [{ imports: [MODULE_IMPORTS] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(LocalTransitiveModule, { imports: [ProvModule] });
})();

export class CmpLocalArray {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpLocalArray, never> = function CmpLocalArray_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpLocalArray)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpLocalArray,
    'c1',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpLocalArray,
    selectors: [['c1']],
    decls: 0,
    vars: 0,
    template: function CmpLocalArray_Template(rf: number, ctx: any): any {},
    dependencies: [NoProvModule, ProvModule],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpLocalArray,
        [
          {
            type: Component,
            args: [{ selector: 'c1', template: '', imports: [NG_COMPONENT_IMPORTS] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpLocalArray, {
      className: 'CmpLocalArray',
      filePath: 'app.module.ts',
      lineNumber: 13,
    });
})();

export class CmpSpread {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpSpread, never> = function CmpSpread_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpSpread)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpSpread,
    'c2',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpSpread,
    selectors: [['c2']],
    decls: 0,
    vars: 0,
    template: function CmpSpread_Template(rf: number, ctx: any): any {},
    dependencies: [NoProvModule, ProvModule],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpSpread,
        [
          {
            type: Component,
            args: [{ selector: 'c2', template: '', imports: [...NG_COMPONENT_IMPORTS] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpSpread, {
      className: 'CmpSpread',
      filePath: 'app.module.ts',
      lineNumber: 16,
    });
})();

export class CmpNested {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpNested, never> = function CmpNested_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || CmpNested)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpNested,
    'c3',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpNested,
    selectors: [['c3']],
    decls: 0,
    vars: 0,
    template: function CmpNested_Template(rf: number, ctx: any): any {},
    dependencies: [NoProvModule, ProvModule],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpNested,
        [{ type: Component, args: [{ selector: 'c3', template: '', imports: NESTED_IMPORTS }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpNested, {
      className: 'CmpNested',
      filePath: 'app.module.ts',
      lineNumber: 19,
    });
})();

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
    'c4',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpNoProv,
    selectors: [['c4']],
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
        [
          {
            type: Component,
            args: [{ selector: 'c4', template: '', imports: [NO_PROVIDER_IMPORTS] }],
          },
        ],
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
      lineNumber: 22,
    });
})();

export class CmpLocalTransitive {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CmpLocalTransitive, never> =
    function CmpLocalTransitive_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || CmpLocalTransitive)();
    };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    CmpLocalTransitive,
    'c5',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: CmpLocalTransitive,
    selectors: [['c5']],
    decls: 0,
    vars: 0,
    template: function CmpLocalTransitive_Template(rf: number, ctx: any): any {},
    dependencies: [LocalTransitiveModule],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CmpLocalTransitive,
        [
          {
            type: Component,
            args: [{ selector: 'c5', template: '', imports: [LocalTransitiveModule] }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(CmpLocalTransitive, {
      className: 'CmpLocalTransitive',
      filePath: 'app.module.ts',
      lineNumber: 25,
    });
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
    never,
    [
      typeof CmpLocalArray,
      typeof CmpSpread,
      typeof CmpNested,
      typeof CmpNoProv,
      typeof CmpLocalTransitive,
    ],
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [CmpLocalArray, CmpSpread, CmpNested, CmpLocalTransitive],
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
                imports: [CmpLocalArray, CmpSpread, CmpNested, CmpNoProv, CmpLocalTransitive],
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
      imports: [CmpLocalArray, CmpSpread, CmpNested, CmpNoProv, CmpLocalTransitive],
    });
})();

```

# /out/lib.ts
```ts
import { NgModule, Directive, Injectable } from '@angular/core';
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
      i0.ɵsetClassMetadata(SaDir, [{ type: Directive, args: [{ selector: '[sa]' }] }], null, null);
  }
}

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

```