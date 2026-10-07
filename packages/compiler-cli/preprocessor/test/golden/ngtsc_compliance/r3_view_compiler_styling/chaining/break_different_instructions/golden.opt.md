# /out/break_different_instructions.ngtypecheck.ts
```ts
/**
 * TCB for /break_different_instructions.ts
 * @generated
 */

import * as i0 from './break_different_instructions';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.one /*111,114*/ /*111,114*/;
    '' + this.one /*156,159*/ /*156,159*/;
    this.yesToApple /*199,209*/ /*199,209*/;
    this.transition /*251,261*/ /*251,261*/;
    this.yesToOrange /*299,310*/ /*299,310*/;
    this.width /*347,352*/ /*347,352*/;
    '' + this.one /*391,394*/ /*391,394*/;
    '' + this.one /*433,436*/ /*433,436*/;
  }
}

```

# /out/break_different_instructions.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  one = '';
  transition = 'all 1337ms ease';
  width = '42px';
  yesToApple = true;
  yesToOrange = true;
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
    vars: 20,
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div');
      }
      if (rf & 2) {
        i0.ɵɵstyleProp('color', i0.ɵɵinterpolate1('a', ctx.one, 'b'))(
          'border',
          i0.ɵɵinterpolate1('a', ctx.one, 'b'),
        )('transition', ctx.transition)('width', ctx.width)(
          'height',
          i0.ɵɵinterpolate1('a', ctx.one, 'b'),
        )('top', i0.ɵɵinterpolate1('a', ctx.one, 'b'));
        i0.ɵɵclassProp('apple', ctx.yesToApple)('orange', ctx.yesToOrange);
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
                        [class.apple]="yesToApple"
                        [style.transition]="transition"
                        [class.orange]="yesToOrange"
                        [style.width]="width"
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
      filePath: 'break_different_instructions.ts',
      lineNumber: 15,
    });
})();

```