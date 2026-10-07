# /out/chain_multiple_property_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_property_bindings.ts
 * @generated
 */

import * as i0 from './chain_multiple_property_bindings';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.myTitle /*101,108*/ /*101,108*/;
    1 /*126,127*/;
    this.myId /*139,143*/ /*139,143*/;
  }
}

```

# /out/chain_multiple_property_bindings.ts
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
        i0.ɵɵdomProperty('title', ctx.myTitle)('tabIndex', 1)('id', ctx.myId);
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
                host: { '[title]': 'myTitle', '[tabindex]': '1', '[id]': 'myId' },
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