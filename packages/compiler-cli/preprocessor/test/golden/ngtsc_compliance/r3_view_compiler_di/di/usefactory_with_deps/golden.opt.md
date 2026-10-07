# /out/usefactory_with_deps.ts
```ts
import { Injectable, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class SomeDep {}
class MyAlternateService {
  constructor(dep: SomeDep, optional: SomeDep | null) {}
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
        __ngConditionalFactory__ = ((dep: SomeDep, optional: SomeDep | null) =>
          new MyAlternateService(dep, optional))(i0.ɵɵinject(SomeDep), i0.ɵɵinject(SomeDep, 8));
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
            args: [
              {
                providedIn: 'root',
                useFactory: (dep: SomeDep, optional: SomeDep | null) =>
                  new MyAlternateService(dep, optional),
                deps: [SomeDep, [new Optional(), SomeDep]],
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