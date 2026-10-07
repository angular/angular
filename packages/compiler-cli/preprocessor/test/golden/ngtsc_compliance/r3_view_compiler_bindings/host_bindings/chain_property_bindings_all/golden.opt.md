# /out/chain_property_bindings_all.ngtypecheck.ts
```ts
/**
 * TCB for /chain_property_bindings_all.ts
 * @generated
 */

import * as i0 from './chain_property_bindings_all';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    1 /*117,118*/;
    this.myTitle /*190,197*/ /*190,197*/;
    this.myId /*234,238*/ /*234,238*/;
  }
}

```

# /out/chain_property_bindings_all.ts
```ts
import { Directive, HostBinding } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  myTitle = 'hello';

  myId = 'special-directive';
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
        i0.ɵɵdomProperty('tabIndex', 1)('title', ctx.myTitle)('id', ctx.myId);
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
                host: { '[tabindex]': '1' },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          myTitle: [{ type: HostBinding, args: ['title'] }],
          myId: [{ type: HostBinding, args: ['id'] }],
        },
      );
  }
}

```