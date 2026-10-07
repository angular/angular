# /out/ctor_overload.ts
```ts
import { Injectable, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

class MyDependency {}
class MyOptionalDependency {}

export class MyService {
  constructor(dep: MyDependency);
  constructor(dep: MyDependency, optionalDep?: MyOptionalDependency) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, [null, { optional: true }]> =
    function MyService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || MyService)(
        i0.ɵɵinject(MyDependency),
        i0.ɵɵinject(MyOptionalDependency, 8),
      );
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
        (): any => [
          { type: MyDependency },
          { type: MyOptionalDependency, decorators: [{ type: Optional }] },
        ],
        null,
      );
  }
}

```