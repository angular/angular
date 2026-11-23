# /out/app.ts
```ts
import { Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BuiltinCtorService {
  constructor(err: ErrorConstructor, arr: Int32ArrayConstructor, dec: MethodDecorator) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BuiltinCtorService, never> =
    function BuiltinCtorService_Factory(__ngFactoryType__: any): any {
      i0.ɵɵinvalidFactory();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({
      token: BuiltinCtorService,
      factory: BuiltinCtorService.ɵfac,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BuiltinCtorService,
        [{ type: Injectable }],
        (): any => [{ type: undefined }, { type: undefined }, { type: undefined }],
        null,
      );
  }
}

```