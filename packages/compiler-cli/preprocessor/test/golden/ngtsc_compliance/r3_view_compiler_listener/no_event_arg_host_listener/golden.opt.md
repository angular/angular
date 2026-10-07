# /out/no_event_arg_host_listener.ngtypecheck.ts
```ts
/**
 * TCB for /no_event_arg_host_listener.ts
 * @generated
 */

import * as i0 from './no_event_arg_host_listener';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    var _t1 = document.createElement('ng-component'); /*182,193*/
    _t1.addEventListener(/*108,119*/ 'mousedown', ($event /*T:EP*/): any => {
      this
        .mousedown /*123,132*/
        () /*123,134*/;
    }) /*108,134*/;
    _t1.addEventListener(/*230,237*/ 'click', ($event /*T:EP*/): any => {
      this
        .click /*241,246*/
        () /*241,246*/;
    }) /*216,238*/;
  }
}

```

# /out/no_event_arg_host_listener.ts
```ts
import { Component, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  mousedown() {}

  click() {}
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
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('mousedown', function MyComponent_mousedown_HostBindingHandler(): any {
          return ctx.mousedown();
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
                template: '',
                host: {
                  '(mousedown)': 'mousedown()',
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
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'no_event_arg_host_listener.ts',
      lineNumber: 10,
    });
})();

```