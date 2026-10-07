# /out/app.module.ts
```ts
import { NgModule } from '@angular/core';
import { SharedConfig } from './shared';
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
  static ɵmod: AppModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<AppModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [...SharedConfig.PROVIDERS],
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
                providers: [...SharedConfig.PROVIDERS],
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

# /out/shared.ts
```ts
import { Injectable } from '@angular/core';
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
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SharedService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

export class SharedConfig {
  static PROVIDERS = [SharedService];
}

```