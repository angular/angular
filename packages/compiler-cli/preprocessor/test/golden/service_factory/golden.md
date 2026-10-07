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
    factory: (): any => (() => new MyService())(),
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyService,
        [{ type: Service, args: [{ factory: () => new MyService() }] }],
        null,
        null,
      );
  }
}

```