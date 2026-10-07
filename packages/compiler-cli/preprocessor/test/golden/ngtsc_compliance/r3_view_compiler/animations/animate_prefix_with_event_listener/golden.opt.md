# /out/animate_prefix_with_event_listener.ngtypecheck.ts
```ts
/**
 * TCB for /animate_prefix_with_event_listener.ts
 * @generated
 */

import * as i0 from './animate_prefix_with_event_listener';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*117,149*/ = document.createElement('p'); /*117,149*/ /*117,149*/
    _t1.addEventListener(/*121,131*/ 'animateABC', ($event /*T:EP*/): any => {
      this
        .doSomething /*134,145*/
        () /*134,147*/;
    }) /*120,148*/;
  }
}

```

# /out/animate_prefix_with_event_listener.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  doSomething() {}
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
    consts: [[3, 'animateABC']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div')(1, 'p', 0);
        i0.ɵɵdomListener(
          'animateABC',
          function MyComponent_Template_p_animateABC_1_listener(): any {
            return ctx.doSomething();
          },
        );
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
          <p (animateABC)="doSomething()">Fading Content</p>
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
      filePath: 'animate_prefix_with_event_listener.ts',
      lineNumber: 11,
    });
})();

```