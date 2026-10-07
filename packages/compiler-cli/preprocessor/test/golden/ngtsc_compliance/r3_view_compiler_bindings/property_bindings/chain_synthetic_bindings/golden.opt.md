# /out/chain_synthetic_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /chain_synthetic_bindings.ts
 * @generated
 */

import * as i0 from './chain_synthetic_bindings';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    this.myTitle /*98,105*/ /*98,105*/;
    this.expansionState /*124,138*/ /*124,138*/;
    1 /*158,159*/;
    ('out') /*176,181*/;
  }
}

```

# /out/chain_synthetic_bindings.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  expansionState = 'expanded';
  myTitle = '';
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
    vars: 4,
    consts: [[3, 'title', 'tabindex']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.myTitle)('@expand', ctx.expansionState)('tabindex', 1)(
          '@fade',
          'out',
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
                template: `
        <button
          [title]="myTitle"
          [@expand]="expansionState"
          [tabindex]="1"
          [@fade]="'out'"></button>
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
      filePath: 'chain_synthetic_bindings.ts',
      lineNumber: 13,
    });
})();

```