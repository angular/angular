# /out/actual.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class ActualModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ActualModule, never> = function ActualModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ActualModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<ActualModule, never, never, never> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: ActualModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<ActualModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ActualModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```

# /out/app.ts
```ts
import { NgModule } from '@angular/core';
import { AliasedModule } from './alias';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './actual';

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
    [typeof i1.ActualModule],
    [typeof i1.ActualModule]
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [AliasedModule, AliasedModule] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        AppModule,
        [
          {
            type: NgModule,
            args: [
              {
                imports: [AliasedModule],
                exports: [AliasedModule],
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
    i0.ɵɵsetNgModuleScope(AppModule, { imports: [AliasedModule], exports: [AliasedModule] });
})();

```