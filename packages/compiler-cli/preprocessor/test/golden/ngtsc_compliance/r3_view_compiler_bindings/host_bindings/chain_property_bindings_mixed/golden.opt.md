# /out/chain_property_bindings_mixed.ngtypecheck.ts
```ts
/**
 * TCB for /chain_property_bindings_mixed.ts
 * @generated
 */

import * as i0 from './chain_property_bindings_mixed';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ('my title') /*105,115*/;
    1 /*138,139*/;
    ('my-id') /*151,158*/;
  }
}

```

# /out/chain_property_bindings_mixed.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
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
        i0.ɵɵdomProperty('title', 'my title')('id', 'my-id');
        i0.ɵɵattribute('tabindex', 1);
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
                host: { '[title]': '"my title"', '[attr.tabindex]': '1', '[id]': '"my-id"' },
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