# /out/chain_synthetic_listeners_mixed.ngtypecheck.ts
```ts
/**
 * TCB for /chain_synthetic_listeners_mixed.ts
 * @generated
 */

import * as i0 from './chain_synthetic_listeners_mixed';
import * as i1 from '@angular/animations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('my-comp'); /*259,270*/
    _t1.addEventListener(/*123,134*/ 'mousedown', ($event /*T:EP*/): any => {
      this
        .mousedown /*138,147*/
        () /*138,149*/;
    }) /*123,149*/;
    ($event: i1.AnimationEvent /*T:EP*/): any => {
      this
        .done /*178,182*/
        () /*178,184*/;
    };
    _t1.addEventListener(/*192,201*/ 'mouseup', ($event /*T:EP*/): any => {
      this
        .mouseup /*205,212*/
        () /*205,214*/;
    }) /*192,214*/;
    ($event: i1.AnimationEvent /*T:EP*/): any => {
      this
        .start /*311,316*/
        () /*311,316*/;
    };
    _t1.addEventListener(/*339,346*/ 'click', ($event /*T:EP*/): any => {
      this
        .click /*350,355*/
        () /*350,355*/;
    }) /*325,347*/;
  }
}

```

# /out/chain_synthetic_listeners_mixed.ts
```ts
import { Component, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  start() {}

  click() {}

  mousedown() {}
  done() {}
  mouseup() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-comp']],
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵsyntheticHostListener(
          '@animation.done',
          function MyComponent_animation_animation_done_HostBindingHandler(): any {
            return ctx.done();
          },
        )(
          '@animation.start',
          function MyComponent_animation_animation_start_HostBindingHandler(): any {
            return ctx.start();
          },
        );
        i0.ɵɵlistener('mousedown', function MyComponent_mousedown_HostBindingHandler(): any {
          return ctx.mousedown();
        })('mouseup', function MyComponent_mouseup_HostBindingHandler(): any {
          return ctx.mouseup();
        })('click', function MyComponent_click_HostBindingHandler(): any {
          return ctx.click();
        });
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {},
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp',
                template: '',
                host: {
                  '(mousedown)': 'mousedown()',
                  '(@animation.done)': 'done()',
                  '(mouseup)': 'mouseup()',
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          start: [{ type: HostListener, args: ['@animation.start'] }],
          click: [{ type: HostListener, args: ['click'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'chain_synthetic_listeners_mixed.ts',
      lineNumber: 13,
    });
})();

```