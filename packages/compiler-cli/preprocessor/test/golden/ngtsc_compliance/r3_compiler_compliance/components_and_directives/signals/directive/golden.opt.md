# /out/directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class SignalDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SignalDir, never> = function SignalDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SignalDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    SignalDir,
    never,
    never,
    {},
    {},
    never,
    never,
    false,
    never,
    true
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: SignalDir, standalone: false, signals: true });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SignalDir,
        [
          {
            type: Directive,
            args: [
              {
                // @ts-ignore
                signals: true,
                standalone: false,
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