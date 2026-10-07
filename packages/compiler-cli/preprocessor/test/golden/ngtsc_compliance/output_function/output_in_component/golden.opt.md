# /out/output_in_component.ngtypecheck.ts
```ts
/**
 * TCB for /output_in_component.ts
 * @generated
 */

import * as i0 from './output_in_component';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
  }
}

```

# /out/output_in_component.ts
```ts
import { Component, EventEmitter, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComp {
  a = output();
  b = output<string>({});
  c = output<void>({ alias: 'cPublic' });
  d = outputFromObservable(new EventEmitter<string>());
  e = outputFromObservable(new EventEmitter<number>());
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'ng-component',
    never,
    {},
    { 'a': 'a'; 'b': 'b'; 'c': 'cPublic'; 'd': 'd'; 'e': 'e' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    outputs: { a: 'a', b: 'b', c: 'cPublic', d: 'd', e: 'e' },
    decls: 1,
    vars: 0,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0, 'Works');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                template: 'Works',
              },
            ],
          },
        ],
        null,
        {
          a: [{ type: i0.Output, args: ['a'] }],
          b: [{ type: i0.Output, args: ['b'] }],
          c: [{ type: i0.Output, args: ['cPublic'] }],
          d: [{ type: i0.Output, args: ['d'] }],
          e: [{ type: i0.Output, args: ['e'] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'output_in_component.ts',
      lineNumber: 7,
    });
})();

```