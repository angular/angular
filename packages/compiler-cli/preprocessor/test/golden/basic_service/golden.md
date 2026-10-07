# /out/generic.service.ts
```ts
import { Service } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GenericService<T> {
  value: T | null = null;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GenericService<any>, never> =
    function GenericService_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || GenericService)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineService({
    token: GenericService,
    factory: GenericService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(GenericService, [{ type: Service }], null, null);
  }
}

```

# /out/service.ts
```ts
import { Service } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyService {
  getData(): string {
    return 'hello';
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyService, never> = function MyService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyService)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineService({
    token: MyService,
    factory: MyService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyService, [{ type: Service }], null, null);
  }
}

```