# /out/break_different_interpolation_instructions.ngtypecheck.ts
```ts
/**
 * TCB for /break_different_interpolation_instructions.ts
 * @generated
 */

import * as i0 from './break_different_interpolation_instructions';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*95,98*/ /*95,98*/;
    '' + this.one /*124,127*/ /*124,127*/;
    '' + this.one /*157,160*/ /*157,160*/ + this.two /*165,168*/ /*165,168*/;
    '' +
      this.one /*193,196*/ /*193,196*/ +
      this.two /*201,204*/ /*201,204*/ +
      this.three /*209,214*/ /*209,214*/;
    '' + this.one /*240,243*/ /*240,243*/;
    '' + this.one /*266,269*/ /*266,269*/;
  }
}

```

# /out/break_different_interpolation_instructions.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  one = '';
  two = '';
  three = '';
  transition = 'all 1337ms ease';
  width = '42px';
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
    vars: 21,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('color', i0.ɵɵinterpolate1('a', ctx.one, 'b'))(
          'border',
          i0.ɵɵinterpolate1('a', ctx.one, 'b'),
        )('transition', i0.ɵɵinterpolate2('a', ctx.one, 'b', ctx.two, 'c'))(
          'width',
          i0.ɵɵinterpolate3('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd'),
        )('height', i0.ɵɵinterpolate1('a', ctx.one, 'b'))(
          'top',
          i0.ɵɵinterpolate1('a', ctx.one, 'b'),
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
        style.color="a{{one}}b"
        style.border="a{{one}}b"
        style.transition="a{{one}}b{{two}}c"
        style.width="a{{one}}b{{two}}c{{three}}d"
        style.height="a{{one}}b"
        style.top="a{{one}}b"></div>`,
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
      filePath: 'break_different_interpolation_instructions.ts',
      lineNumber: 13,
    });
})();

```