# /out/input_history_directive.ts
```ts
import { Directive, Optional, Self } from '@angular/core';
import { MatFormFieldControl, ShadowedByPrivateImport } from './public-api';
// @ts-ignore
import * as i0 from '@angular/core';

export class FooDirective {
  constructor(
    private readonly matInput: MatFormFieldControl<string> | null,
    private readonly other: ShadowedByPrivateImport,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FooDirective, [{ optional: true; self: true }, null]> =
    function FooDirective_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || FooDirective)(
        i0.ɵɵdirectiveInject(MatFormFieldControl, 10),
        i0.ɵɵdirectiveInject(ShadowedByPrivateImport),
      );
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FooDirective,
    '[foo]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: FooDirective, selectors: [['', 'foo', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooDirective,
        [{ type: Directive, args: [{ selector: '[foo]' }] }],
        (): any => [
          { type: MatFormFieldControl, decorators: [{ type: Optional }, { type: Self }] },
          { type: ShadowedByPrivateImport },
        ],
        null,
      );
  }
}

```