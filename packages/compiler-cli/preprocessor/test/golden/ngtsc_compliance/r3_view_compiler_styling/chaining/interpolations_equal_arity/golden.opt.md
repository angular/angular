# /out/interpolations_equal_arity.ngtypecheck.ts
```ts
/**
 * TCB for /interpolations_equal_arity.ts
 * @generated
 */

import * as i0 from './interpolations_equal_arity';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*94,97*/ /*94,97*/;
    '' + this.one /*122,125*/ /*122,125*/;
    '' + this.one /*154,157*/ /*154,157*/;
  }
}

```

# /out/interpolations_equal_arity.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  one = '';
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
    vars: 9,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('color', i0.ɵɵinterpolate1('a', ctx.one, 'b'))(
          'border',
          i0.ɵɵinterpolate1('a', ctx.one, 'b'),
        )('transition', i0.ɵɵinterpolate1('a', ctx.one, 'b'));
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
       style.color="a{{one}}b"
       style.border="a{{one}}b"
       style.transition="a{{one}}b"></div>`,
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
      filePath: 'interpolations_equal_arity.ts',
      lineNumber: 10,
    });
})();

```