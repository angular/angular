# /out/chain_synthetic_properties.ngtypecheck.ts
```ts
/**
 * TCB for /chain_synthetic_properties.ts
 * @generated
 */

import * as i0 from './chain_synthetic_properties';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.expandedState /*107,120*/ /*107,120*/;
    true /*138,142*/;
    this.isSmall /*159,166*/ /*159,166*/;
  }
}

```

# /out/chain_synthetic_properties.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  expandedState = 'collapsed';
  isSmall = true;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDirective, never> = function MyDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDirective,
    '[my-dir]',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDirective,
    selectors: [['', 'my-dir', '']],
    hostVars: 3,
    hostBindings: function MyDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵsyntheticHostProperty('@expand', ctx.expandedState)('@fadeOut', true)(
          '@shrink',
          ctx.isSmall,
        );
      }
    },
    standalone: false,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[my-dir]',
                host: {
                  '[@expand]': 'expandedState',
                  '[@fadeOut]': 'true',
                  '[@shrink]': 'isSmall',
                },
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