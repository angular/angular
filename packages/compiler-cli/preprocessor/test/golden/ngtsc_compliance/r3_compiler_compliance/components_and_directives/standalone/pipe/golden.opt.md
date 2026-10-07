# /out/pipe.ts
```ts
import { Pipe } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandalonePipe {
  transform(value: any): any {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandalonePipe, never> = function StandalonePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandalonePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<StandalonePipe, 'stpipe', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'stpipe', type: StandalonePipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        StandalonePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'stpipe',
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