# /out/interpolations_different_arity.ngtypecheck.ts
```ts
/**
 * TCB for /interpolations_different_arity.ts
 * @generated
 */

import * as i0 from './interpolations_different_arity';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*95,98*/ /*95,98*/;
    '' + this.one /*124,127*/ /*124,127*/;
    '' + this.one /*157,160*/ /*157,160*/ + this.two /*165,168*/ /*165,168*/;
    '' + this.one /*193,196*/ /*193,196*/ + this.two /*201,204*/ /*201,204*/;
    '' +
      this.one /*230,233*/ /*230,233*/ +
      this.two /*238,241*/ /*238,241*/ +
      this.three /*246,251*/ /*246,251*/;
    '' +
      this.one /*274,277*/ /*274,277*/ +
      this.two /*282,285*/ /*282,285*/ +
      this.three /*290,295*/ /*290,295*/;
  }
}

```

# /out/interpolations_different_arity.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  one = '';
  two = '';
  three = '';
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
    vars: 24,
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
          i0.ɵɵinterpolate2('a', ctx.one, 'b', ctx.two, 'c'),
        )('height', i0.ɵɵinterpolate3('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd'))(
          'top',
          i0.ɵɵinterpolate3('a', ctx.one, 'b', ctx.two, 'c', ctx.three, 'd'),
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
        style.width="a{{one}}b{{two}}c"
        style.height="a{{one}}b{{two}}c{{three}}d"
        style.top="a{{one}}b{{two}}c{{three}}d"></div>`,
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
      filePath: 'interpolations_different_arity.ts',
      lineNumber: 13,
    });
})();

```