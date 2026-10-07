# /out/chain_multiple_bindings_mixed.ngtypecheck.ts
```ts
/**
 * TCB for /chain_multiple_bindings_mixed.ts
 * @generated
 */

import * as i0 from './chain_multiple_bindings_mixed';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    1 /*97,98*/;
    2 /*106,107*/;
    3 /*126,127*/;
    '' + (1 /*155,156*/ + 3 /*159,160*/) /*155,160*/;
  }
}

```

# /out/chain_multiple_bindings_mixed.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
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
    vars: 5,
    consts: [[3, 'id']],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button', 0);
      }
      if (rf & 2) {
        i0.ɵɵattribute('aria-label', i0.ɵɵinterpolate1('prefix-', 1 + 3));
        i0.ɵɵproperty('id', 2);
        i0.ɵɵattribute('title', 1)('tabindex', 3);
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
        <button [attr.title]="1" [id]="2" [attr.tabindex]="3" attr.aria-label="prefix-{{1 + 3}}">
        </button>
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
      filePath: 'chain_multiple_bindings_mixed.ts',
      lineNumber: 10,
    });
})();

```