# /out/nameless_pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// TODO(crisbeto): remove `null!` from the pipes when public API is updated.
export class PipeWithoutName implements PipeTransform {
  transform(value: unknown) {
    return value;
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PipeWithoutName, never> = function PipeWithoutName_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || PipeWithoutName)();
  };
  // @ts-ignore
  static ɵpipe: i0.ɵɵPipeDeclaration<PipeWithoutName, 'PipeWithoutName', true> =
    /*@__PURE__*/ i0.ɵɵdefinePipe({ name: 'PipeWithoutName', type: PipeWithoutName, pure: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(PipeWithoutName, [{ type: Pipe }], null, null);
  }
}

```