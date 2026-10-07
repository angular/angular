# /out/style_binding_suffixed.ngtypecheck.ts
```ts
/**
 * TCB for /style_binding_suffixed.ts
 * @generated
 */

import * as i0 from './style_binding_suffixed';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*99,102*/ /*99,102*/ + this.two /*107,110*/ /*107,110*/;
  }
}

```

# /out/style_binding_suffixed.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  one = '';
  two = '';
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
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('width', i0.ɵɵinterpolate2('a', ctx.one, 'b', ctx.two, 'c'), 'px');
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
        <div style.width.px="a{{one}}b{{two}}c"></div>
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
      filePath: 'style_binding_suffixed.ts',
      lineNumber: 9,
    });
})();

```