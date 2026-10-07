# /out/usefactory_without_deps.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class MyAlternateService {}

function alternateFactory() {
  return new MyAlternateService();
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
    factory: (): any => alternateFactory(),
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [{ type: Injectable, args: [{ providedIn: 'root', useFactory: alternateFactory }] }],
        null,
        null,
      );
  }
}

```