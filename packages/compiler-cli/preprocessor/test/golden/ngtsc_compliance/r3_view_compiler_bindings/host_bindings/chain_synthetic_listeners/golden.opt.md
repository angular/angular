# /out/chain_synthetic_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /chain_synthetic_listeners.ts
 * @generated
 */

import * as i0 from './chain_synthetic_listeners';
import * as i1 from '@angular/animations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    ($event: i1.AnimationEvent /*T:EP*/): any => {
      this
        .done /*144,148*/
        () /*144,150*/;
    };
    ($event: i1.AnimationEvent /*T:EP*/): any => {
      this
        .start /*247,252*/
        () /*247,252*/;
    };
  }
}

```

# /out/chain_synthetic_listeners.ts
```ts
import { Component, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  start() {}

  done() {}
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
                  '(@animation.done)': 'done()',
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        { start: [{ type: HostListener, args: ['@animation.start'] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'chain_synthetic_listeners.ts',
      lineNumber: 11,
    });
})();

```