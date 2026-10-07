# /out/utf16-semantics.ts
```ts
// José is here 😊
import { Component, Input, Output, EventEmitter } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Utf16Component {
  // "José" has 'é' (2 bytes, 1 char)
  // "😊" is 4 bytes, 2 chars (surrogates)
  jose: string = 'José';

  aliased: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Utf16Component, never> = function Utf16Component_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Utf16Component)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    Utf16Component,
    'app-root',
    never,
    {
      'jose': { 'alias': 'jose'; 'required': false };
      'aliased': { 'alias': 'aliased😊'; 'required': false };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: Utf16Component,
    selectors: [['app-root']],
    inputs: { jose: 'jose', aliased: [0, 'aliased😊', 'aliased'] },
    decls: 2,
    vars: 0,
    template: function Utf16Component_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'José & 😊');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Utf16Component,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-root',
                template: `
        <div>José & 😊</div>
      `,
                standalone: true,
              },
            ],
          },
        ],
        null,
        { jose: [{ type: Input }], aliased: [{ type: Input, args: ['aliased😊'] }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Utf16Component, {
      className: 'Utf16Component',
      filePath: 'utf16-semantics.ts',
      lineNumber: 11,
    });
})();

```