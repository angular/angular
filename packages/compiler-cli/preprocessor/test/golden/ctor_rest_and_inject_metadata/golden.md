# /out/app.ts
```ts
import { Inject, Injectable, InjectionToken } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class DepService {}
export const TOKEN = new InjectionToken<DepService>('TOKEN');

export class RestService {
  constructor(...args: unknown[]) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<RestService, never> = function RestService_Factory(
    __ngFactoryType__: any,
  ): any {
    i0.ɵɵinvalidFactory();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: RestService, factory: RestService.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        RestService,
        [{ type: Injectable }],
        (): any => [{ type: undefined }],
        null,
      );
  }
}

export class InjectedService {
  constructor(dep: DepService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<InjectedService, never> = function InjectedService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || InjectedService)(i0.ɵɵinject(TOKEN));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: InjectedService, factory: InjectedService.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        InjectedService,
        [{ type: Injectable }],
        (): any => [{ type: DepService, decorators: [{ type: Inject, args: [TOKEN] }] }],
        null,
      );
  }
}

```