# /out/useclass_without_deps.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class MyAlternateService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyAlternateService, never> =
    function MyAlternateService_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || MyAlternateService)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyAlternateService,
    factory: MyAlternateService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyAlternateService, [{ type: Injectable }], null, null);
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
    factory: (__ngFactoryType__: any): any => MyAlternateService.ɵfac(__ngFactoryType__),
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [{ type: Injectable, args: [{ providedIn: 'root', useClass: MyAlternateService }] }],
        null,
        null,
      );
  }
}

```