# /out/chain_multiple_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_listeners.ts
 * @generated
 */

import * as i0 from './chain_multiple_listeners';

/*tcb1*/
function _tcb1(this: i0.MyDirective) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-directive'); /*224,235*/
    _t1.addEventListener(/*116,127*/ 'mousedown', ($event /*T:EP*/): any => {
      this
        .mousedown /*131,140*/
        () /*131,142*/;
    }) /*116,142*/;
    _t1.addEventListener(/*154,163*/ 'mouseup', ($event /*T:EP*/): any => {
      this
        .mouseup /*167,174*/
        () /*167,176*/;
    }) /*154,176*/;
    _t1.addEventListener(/*287,294*/ 'click', ($event /*T:EP*/): any => {
      this
        .click /*298,303*/
        () /*298,303*/;
    }) /*273,295*/;
  }
}

```

# /out/chain_multiple_listeners.ts
```ts
import { Directive, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDirective {
  mousedown() {}
  mouseup() {}

  click() {}
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
    hostBindings: function MyDirective_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('mousedown', function MyDirective_mousedown_HostBindingHandler(): any {
          return ctx.mousedown();
        })('mouseup', function MyDirective_mouseup_HostBindingHandler(): any {
          return ctx.mouseup();
        })('click', function MyDirective_click_HostBindingHandler(): any {
          return ctx.click();
        });
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
                  '(mousedown)': 'mousedown()',
                  '(mouseup)': 'mouseup()',
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        { click: [{ type: HostListener, args: ['click'] }] },
      );
  }
}

```