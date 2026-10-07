# /out/chain_bindings_with_interpolations.ngtypecheck.ts
```ts
/**
 * TCB for /chain_bindings_with_interpolations.ts
 * @generated
 */

import * as i0 from './chain_bindings_with_interpolations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    1 /*103,104*/;
    2 /*123,124*/;
    '' + (0 /*156,157*/ + 3 /*160,161*/) /*156,161*/;
    '' + (1 /*196,197*/ + 3 /*200,201*/) /*196,201*/ + (2 /*206,207*/ + 3 /*210,211*/) /*206,211*/;
  }
}

```

# /out/chain_bindings_with_interpolations.ts
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
    vars: 7,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'button');
      }
      if (rf & 2) {
        i0.ɵɵattribute('tabindex', i0.ɵɵinterpolate1('prefix-', 0 + 3))(
          'aria-label',
          i0.ɵɵinterpolate2('hello-', 1 + 3, '-', 2 + 3),
        )('title', 1)('id', 2);
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
          [attr.title]="1"
          [attr.id]="2"
          attr.tabindex="prefix-{{0 + 3}}"
          attr.aria-label="hello-{{1 + 3}}-{{2 + 3}}"></button>`,
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
      filePath: 'chain_bindings_with_interpolations.ts',
      lineNumber: 12,
    });
})();

```