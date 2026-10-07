# /out/mixed_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /mixed_bindings.ts
 * @generated
 */

import * as i0 from './mixed_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.yesToApple /*94,104*/ /*94,104*/;
    this.color /*125,130*/ /*125,130*/;
    this.yesToOrange /*152,163*/ /*152,163*/;
    this.border /*185,191*/ /*185,191*/;
    this.yesToTomato /*213,224*/ /*213,224*/;
    this.transition /*250,260*/ /*250,260*/;
  }
}

```

# /out/mixed_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  color = 'red';
  border = '1px solid purple';
  transition = 'all 1337ms ease';
  yesToApple = true;
  yesToOrange = true;
  yesToTomato = false;
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
    vars: 12,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('color', ctx.color)('border', ctx.border)('transition', ctx.transition);
        i0.ɵɵclassProp('apple', ctx.yesToApple)('orange', ctx.yesToOrange)(
          'tomato',
          ctx.yesToTomato,
        );
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
                template: `<div
        [class.apple]="yesToApple"
        [style.color]="color"
        [class.orange]="yesToOrange"
        [style.border]="border"
        [class.tomato]="yesToTomato"
        [style.transition]="transition"></div>`,
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
      filePath: 'mixed_bindings.ts',
      lineNumber: 13,
    });
})();

```