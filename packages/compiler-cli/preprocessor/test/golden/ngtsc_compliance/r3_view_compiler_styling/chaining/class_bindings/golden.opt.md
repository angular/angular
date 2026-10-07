# /out/class_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /class_bindings.ts
 * @generated
 */

import * as i0 from './class_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.yesToApple /*93,103*/ /*93,103*/;
    this.yesToOrange /*124,135*/ /*124,135*/;
    this.yesToTomato /*156,167*/ /*156,167*/;
  }
}

```

# /out/class_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
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
    vars: 6,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
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
       [class.orange]="yesToOrange"
       [class.tomato]="yesToTomato"></div>`,
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
      filePath: 'class_bindings.ts',
      lineNumber: 10,
    });
})();

```