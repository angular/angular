# /out/chain_multiple_single_interpolation.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_single_interpolation.ts
 * @generated
 */

import * as i0 from './chain_multiple_single_interpolation';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.myTitle /*97,104*/ /*97,104*/;
    '' + this.buttonId /*119,127*/ /*119,127*/;
    '' + 1 /*148,149*/;
  }
}

```

# /out/chain_multiple_single_interpolation.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  myTitle = 'hello';
  buttonId = 'special-button';
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
    vars: 3,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button');
      }
      if (rf & 2) {
        i0.ɵɵattribute('title', ctx.myTitle)('id', ctx.buttonId)('tabindex', 1);
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
                template: `
        <button attr.title="{{myTitle}}" attr.id="{{buttonId}}" attr.tabindex="{{1}}"></button>
      `,
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
      filePath: 'chain_multiple_single_interpolation.ts',
      lineNumber: 9,
    });
})();

```