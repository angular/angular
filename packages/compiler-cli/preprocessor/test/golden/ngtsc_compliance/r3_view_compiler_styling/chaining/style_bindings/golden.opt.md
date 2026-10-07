# /out/style_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /style_bindings.ts
 * @generated
 */

import * as i0 from './style_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.color /*94,99*/ /*94,99*/;
    this.border /*121,127*/ /*121,127*/;
    this.transition /*153,163*/ /*153,163*/;
  }
}

```

# /out/style_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  color = 'red';
  border = '1px solid purple';
  transition = 'all 1337ms ease';
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
    vars: 6,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('color', ctx.color)('border', ctx.border)('transition', ctx.transition);
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
        [style.color]="color"
        [style.border]="border"
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
      filePath: 'style_bindings.ts',
      lineNumber: 10,
    });
})();

```