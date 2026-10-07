# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedModule } from './shared.module';
import { PublicDir, PrivateCmp, AliasedPipe, InternalCmp } from './widgets';
import { AliasedPipe as ReexportedPipe } from './widgets';
// @ts-ignore
import * as i0 from '@angular/core';

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
    [typeof PublicDir, typeof AliasedPipe],
    never,
    [typeof PublicDir, typeof ReexportedPipe, typeof SharedModule]
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule, SharedModule],
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
                declarations: [PublicDir, PrivateCmp, AliasedPipe],
                imports: [SharedModule],
                exports: [PublicDir, ReexportedPipe, SharedModule],
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
      declarations: [PublicDir, PrivateCmp, AliasedPipe],
      imports: [SharedModule],
      exports: [PublicDir, ReexportedPipe, SharedModule],
    });
})();

// Declares nothing it exports: the declarations tuple collapses to `never`.
export class InternalModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InternalModule, never> = function InternalModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InternalModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<InternalModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: InternalModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<InternalModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    imports: [SharedModule],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InternalModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [InternalCmp],
                imports: [SharedModule],
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
    i0.ɵɵsetNgModuleScope(InternalModule, { declarations: [InternalCmp], imports: [SharedModule] });
})();

```

# /out/shared.module.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SharedModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SharedModule, never> = function SharedModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SharedModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<SharedModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: SharedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<SharedModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(SharedModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```

# /out/widgets.ngtypecheck.ts
```ts
/**
 * TCB for /widgets.ts
 * @generated
 */

import * as i0 from './widgets';

/*tcb1*/
function _tcb1(this: i0.PrivateCmp) {
  if (true) {
  }
}

/*tcb2*/
function _tcb2(this: i0.InternalCmp) {
  if (true) {
  }
}

```

# /out/widgets.ts
```ts
import { Component, Directive, Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PublicDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PublicDir, never> = function PublicDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PublicDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    PublicDir,
    '[publicDir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: PublicDir,
    selectors: [['', 'publicDir', '']],
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PublicDir,
        [{ type: Directive, args: [{ selector: '[publicDir]', standalone: false }] }],
        null,
        null,
      );
  }
}

export class PrivateCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PrivateCmp, never> = function PrivateCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PrivateCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    PrivateCmp,
    'private-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: PrivateCmp,
    selectors: [['private-cmp']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function PrivateCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PrivateCmp,
        [{ type: Component, args: [{ selector: 'private-cmp', template: '', standalone: false }] }],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(PrivateCmp, {
      className: 'PrivateCmp',
      filePath: 'widgets.ts',
      lineNumber: 7,
    });
})();

export class InternalCmp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InternalCmp, never> = function InternalCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || InternalCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    InternalCmp,
    'internal-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: InternalCmp,
    selectors: [['internal-cmp']],
    standalone: false,
    decls: 0,
    vars: 0,
    template: function InternalCmp_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InternalCmp,
        [
          {
            type: Component,
            args: [{ selector: 'internal-cmp', template: '', standalone: false }],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(InternalCmp, {
      className: 'InternalCmp',
      filePath: 'widgets.ts',
      lineNumber: 10,
    });
})();

export class AliasedPipe {
  transform(v: unknown) {
    return v;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<AliasedPipe, never> = function AliasedPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || AliasedPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<AliasedPipe, 'aliased', false> = /*@__PURE__*/ i0.ɵɵdefinePipe(
    { name: 'aliased', type: AliasedPipe, pure: true, standalone: false },
  );
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AliasedPipe,
        [{ type: Pipe, args: [{ name: 'aliased', standalone: false }] }],
        null,
        null,
      );
  }
}

```