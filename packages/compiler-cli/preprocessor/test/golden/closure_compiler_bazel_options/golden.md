# /out/service.ts
```ts
import { Service } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class BazelService {
  getData(): string {
    return 'data';
  }
  /** @nocollapse */
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BazelService, never> = function BazelService_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || BazelService)();
  };
  /** @nocollapse */
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineService({
    token: BazelService,
    factory: BazelService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(BazelService, [{ type: Service }], null, null);
  }
}

```