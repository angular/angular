# /out/test.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class PlainService {}

export class Foo {
  constructor(private s: PlainService) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Foo, never> = function Foo_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || Foo)(i0.ɵɵdirectiveInject(PlainService));
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<Foo, 'app-foo', never, {}, {}, never, never, true, never> =
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: Foo,
      selectors: [['app-foo']],
      decls: 2,
      vars: 0,
      template: function Foo_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'div');
          i0.ɵɵtext(1, 'Foo');
          i0.ɵɵelementEnd();
        }
      },
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Foo,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-foo',
                template: '<div>Foo</div>',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [{ type: PlainService }],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(Foo, { className: 'Foo', filePath: 'test.ts', lineNumber: 10 });
})();

```