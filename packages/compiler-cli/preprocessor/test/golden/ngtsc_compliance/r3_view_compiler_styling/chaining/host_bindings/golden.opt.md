# /out/host_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /host_bindings.ts
 * @generated
 */

import * as i0 from './host_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.yesToApple /*124,134*/ /*124,134*/;
    this.color /*163,168*/ /*163,168*/;
    this.yesToTomato /*198,209*/ /*198,209*/;
    this.transition /*243,253*/ /*243,253*/;
    this.border /*425,439*/ /*425,439*/;
    this.yesToOrange /*486,500*/ /*486,500*/;
  }
}

```

# /out/host_bindings.ts
```ts
import { Component, HostBinding } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  color = 'red';
  transition = 'all 1337ms ease';
  yesToApple = true;
  yesToTomato = false;

  border = '1px solid purple';

  yesToOrange = true;
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
    hostVars: 12,
    hostBindings: function MyComponent_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵstyleProp('color', ctx.color)('transition', ctx.transition)('border', ctx.border);
        i0.ɵɵclassProp('apple', ctx.yesToApple)('tomato', ctx.yesToTomato)(
          'orange',
          ctx.yesToOrange,
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
                template: '',
                host: {
                  '[class.apple]': 'yesToApple',
                  '[style.color]': 'color',
                  '[class.tomato]': 'yesToTomato',
                  '[style.transition]': 'transition',
                },
                standalone: false,
              },
            ],
          },
        ],
        null,
        {
          border: [{ type: HostBinding, args: ['style.border'] }],
          yesToOrange: [{ type: HostBinding, args: ['class.orange'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'host_bindings.ts',
      lineNumber: 13,
    });
})();

```