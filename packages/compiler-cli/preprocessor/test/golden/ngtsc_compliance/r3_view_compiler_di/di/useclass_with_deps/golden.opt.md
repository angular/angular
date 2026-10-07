# /out/useclass_with_deps.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class SomeDep {}

class MyAlternateService {
  constructor(dep: SomeDep) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyAlternateService, never> =
    function MyAlternateService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || MyAlternateService)(i0.ɵɵinject(SomeDep));
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyAlternateService,
    factory: MyAlternateService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyAlternateService,
        [{ type: Injectable }],
        (): any => [{ type: SomeDep }],
        null,
      );
  }
}

export class MyService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never> = function MyService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: function MyService_Factory(__ngFactoryType__: any): any {
      let __ngConditionalFactory__: any = null;
      if (__ngFactoryType__) {
        __ngConditionalFactory__ = new __ngFactoryType__();
      } else {
        /* @ts-ignore */
        __ngConditionalFactory__ = new MyAlternateService(i0.ɵɵinject(SomeDep));
      }
      return __ngConditionalFactory__;
    },
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [
          {
            type: Injectable,
            args: [{ providedIn: 'root', useClass: MyAlternateService, deps: [SomeDep] }],
          },
        ],
        null,
        null,
      );
  }
}

```