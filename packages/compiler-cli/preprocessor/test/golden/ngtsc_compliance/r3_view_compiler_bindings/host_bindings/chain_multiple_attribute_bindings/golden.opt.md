# /out/chain_multiple_attribute_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_attribute_bindings.ts
 * @generated
 */

import * as i0 from './chain_multiple_attribute_bindings';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myTitle /*110,117*/ /*110,117*/;
    1 /*140,141*/;
    this.myId /*158,162*/ /*158,162*/;
  }
}

```

# /out/chain_multiple_attribute_bindings.ts
```ts
import { Directive } from '@angular/core';
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
        i0.ɵɵattribute('title', ctx.myTitle)('tabindex', 1)('id', ctx.myId);
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
                host: { '[attr.title]': 'myTitle', '[attr.tabindex]': '1', '[attr.id]': 'myId' },
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