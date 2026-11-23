# /out/app.ts
```ts
import { Injectable } from '@angular/core';
import * as myLib from './ambient';
// @ts-ignore
import * as i0 from '@angular/core';

export class UsesInterface {
  constructor(svc: myLib.IService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UsesInterface, never> = function UsesInterface_Factory(
    __ngFactoryType__: any,
  ): any {
    i0.ɵɵinvalidFactory();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UsesInterface, factory: UsesInterface.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UsesInterface,
        [{ type: Injectable }],
        (): any => [{ type: undefined }],
        null,
      );
  }
}

export class UsesClass {
  constructor(svc: myLib.RealService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UsesClass, never> = function UsesClass_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || UsesClass)(i0.ɵɵinject(myLib.RealService));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: UsesClass, factory: UsesClass.ɵfac });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UsesClass,
        [{ type: Injectable }],
        (): any => [{ type: myLib.RealService }],
        null,
      );
  }
}

```