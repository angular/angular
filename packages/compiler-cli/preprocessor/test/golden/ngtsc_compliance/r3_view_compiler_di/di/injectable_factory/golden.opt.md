# /out/injectable_factory.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class MyDependency {}

export class MyService {
  constructor(dep: MyDependency) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never> = function MyService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || MyService)(i0.ɵɵinject(MyDependency));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MyService,
    factory: MyService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [{ type: Injectable }],
        (): any => [{ type: MyDependency }],
        null,
      );
  }
}

```