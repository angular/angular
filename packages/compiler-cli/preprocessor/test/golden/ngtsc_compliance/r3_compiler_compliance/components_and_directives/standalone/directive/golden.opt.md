# /out/directive.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class StandaloneDir {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<StandaloneDir, never> = function StandaloneDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || StandaloneDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    StandaloneDir,
    never,
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: StandaloneDir });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(StandaloneDir, [{ type: Directive, args: [{}] }], null, null);
  }
}

```