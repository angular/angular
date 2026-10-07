# /out/test.ts
```ts
import { Component, Inject } from '@angular/core';
import { TypeOnlySymbol, DI_TOKEN } from './some_file';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCase {
  constructor(private injected: TypeOnlySymbol) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCase, never> = function TestCase_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || TestCase)(i0.ɵɵdirectiveInject(DI_TOKEN));
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCase,
    'app-test',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCase,
    selectors: [['app-test']],
    decls: 2,
    vars: 0,
    template: function TestCase_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1, 'Test');
        i0.ɵɵelementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCase,
        [
          {
            type: Component,
            args: [
              {
                selector: 'app-test',
                template: '<div>Test</div>',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [{ type: undefined, decorators: [{ type: Inject, args: [DI_TOKEN] }] }],
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestCase, { className: 'TestCase', filePath: 'test.ts', lineNumber: 9 });
})();

```