# /out/animate_leave_with_binding.ngtypecheck.ts
```ts
/**
 * TCB for /animate_leave_with_binding.ts
 * @generated
 */

import * as i0 from './animate_leave_with_binding';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this
      .leaveClass /*145,155*/
      () /*145,157*/;
  }
}

```

# /out/animate_leave_with_binding.ts
```ts
import { Component, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  leaveClass = signal(
    'fade',
    ...((ngDevMode ? [{ debugName: 'leaveClass' }] : /* istanbul ignore next */ []) as []),
  );
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
        i0.ɵɵanimateLeave(function MyComponent_Template_animateleave_cb(): any {
          return ctx.leaveClass();
        });
        i0.ɵɵtext(2, 'Fading Content');
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
          <p [animate.leave]="leaveClass()">Fading Content</p>
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
      filePath: 'animate_leave_with_binding.ts',
      lineNumber: 11,
    });
})();

```