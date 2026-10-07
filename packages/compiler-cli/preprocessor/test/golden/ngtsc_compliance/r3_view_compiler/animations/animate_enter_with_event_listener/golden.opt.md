# /out/animate_enter_with_event_listener.ngtypecheck.ts
```ts
/**
 * TCB for /animate_enter_with_event_listener.ts
 * @generated
 */

import * as i0 from './animate_enter_with_event_listener';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    ($event: i1.AnimationCallbackEvent /*T:EP*/): any => {
      this.slideFn(/*161,168*/ $event /*169,175*/) /*161,176*/;
    };
  }
}

```

# /out/animate_enter_with_event_listener.ts
```ts
import { Component, AnimationCallbackEvent } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  slideFn(event: AnimationCallbackEvent) {
    event.target.classList.add('slide-in');
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    decls: 3,
    vars: 0,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div')(1, 'p');
        i0.ɵɵanimateEnterListener(function MyComponent_Template_p_animateenter_1_listener(
          $event: any,
        ): any {
          return ctx.slideFn($event);
        });
        i0.ɵɵtext(2, 'Sliding Content');
        i0.ɵɵdomElementEnd()();
      }
    },
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
                selector: 'my-component',
                template: `
        <div>
          <p (animate.enter)="slideFn($event)">Sliding Content</p>
        </div>
      `,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'animate_enter_with_event_listener.ts',
      lineNumber: 11,
    });
})();

```