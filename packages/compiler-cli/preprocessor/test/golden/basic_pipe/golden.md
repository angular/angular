# /out/generic.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class GenericPipe<T> implements PipeTransform {
  transform(value: T): T {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<GenericPipe<any>, never> = function GenericPipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || GenericPipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<GenericPipe<any>, 'generic', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'generic', type: GenericPipe, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        GenericPipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'generic',
                pure: true,
                standalone: true,
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

# /out/upcase.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class UpcasePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<UpcasePipe, never> = function UpcasePipe_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || UpcasePipe)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<UpcasePipe, 'upcase', true> = /*@__PURE__*/ i0.ɵɵdefinePipe({
    name: 'upcase',
    type: UpcasePipe,
    pure: true,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        UpcasePipe,
        [
          {
            type: Pipe,
            args: [
              {
                name: 'upcase',
                pure: true,
                standalone: true,
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