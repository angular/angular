# /out/no_event_arg_listener.ngtypecheck.ts
```ts
/**
 * TCB for /no_event_arg_listener.ts
 * @generated
 */

import * as i0 from './no_event_arg_listener';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*70,96*/ = document.createElement('div'); /*70,96*/ /*70,96*/
    _t1.addEventListener(/*76,81*/ 'click', ($event /*T:EP*/): any => {
      this
        .onClick /*84,91*/
        () /*84,93*/;
    }) /*75,95*/;
  }
}

```

# /out/no_event_arg_listener.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  onClick() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 0,
    consts: [[3, 'click']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 0);
        i0.ɵɵlistener('click', function MyComponent_Template_div_click_0_listener(): any {
          return ctx.onClick();
        });
        i0.ɵɵelementEnd();
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
                template: `<div (click)="onClick();"></div>`,
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'no_event_arg_listener.ts',
      lineNumber: 7,
    });
})();

```