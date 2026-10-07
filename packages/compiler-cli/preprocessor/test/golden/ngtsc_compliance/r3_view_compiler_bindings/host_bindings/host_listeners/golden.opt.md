# /out/host_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /host_listeners.ts
 * @generated
 */

import * as i0 from './host_listeners';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    document.addEventListener(/*114,133*/ 'dragover', ($event /*T:EP*/): any => {
      this.foo(/*137,140*/ $event /*141,147*/) /*137,148*/;
    }) /*114,148*/;
  }
}

```

# /out/host_listeners.ts
```ts
import { Component, HostListener } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  foo!: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-cmp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-cmp']],
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener(
          'dragover',
          function MyComponent_dragover_HostBindingHandler($event: any): any {
            return ctx.foo($event);
          },
          i0.ɵɵresolveDocument,
        );
      }
    },
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
                selector: 'my-cmp',
                host: {
                  '(document:dragover)': 'foo($event)',
                },
                template: `
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
      filePath: 'host_listeners.ts',
      lineNumber: 11,
    });
})();

```