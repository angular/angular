# /out/chain_attribute_bindings_mixed.ngtypecheck.ts
```ts
/**
 * TCB for /chain_attribute_bindings_mixed.ts
 * @generated
 */

import * as i0 from './chain_attribute_bindings_mixed';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ('my title') /*110,120*/;
    1 /*138,139*/;
    ('my-id') /*156,163*/;
  }
}

```

# /out/chain_attribute_bindings_mixed.ts
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
        i0.ɵɵdomProperty('tabIndex', 1);
        i0.ɵɵattribute('title', 'my title')('id', 'my-id');
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
                host: { '[attr.title]': '"my title"', '[tabindex]': '1', '[attr.id]': '"my-id"' },
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