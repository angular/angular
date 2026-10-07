# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { getFeatureProviders } from './feature';
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<AppModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [...getFeatureProviders()],
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
                providers: [...getFeatureProviders()],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```

# /out/feature.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FeatureService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FeatureService, never> = function FeatureService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FeatureService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: FeatureService,
    factory: FeatureService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(FeatureService, [{ type: Injectable }], null, null);
  }
}

export function getFeatureProviders() {
  return [FeatureService];
}

```