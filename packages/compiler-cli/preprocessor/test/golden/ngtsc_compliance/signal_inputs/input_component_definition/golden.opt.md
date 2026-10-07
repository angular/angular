# /out/input_component_definition.ngtypecheck.ts
```ts
/**
 * TCB for /input_component_definition.ts
 * @generated
 */

import * as i0 from './input_component_definition';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
  }
}

```

# /out/input_component_definition.ts
```ts
import { Component, input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComp {
  counter = input(
    0,
    ...((ngDevMode ? [{ debugName: 'counter' }] : /* istanbul ignore next */ []) as []),
  );
  name = input.required<string>(
    ...((ngDevMode ? [{ debugName: 'name' }] : /* istanbul ignore next */ []) as []),
  );
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
    {
      'counter': { 'alias': 'counter'; 'required': false; 'isSignal': true };
      'name': { 'alias': 'name'; 'required': true; 'isSignal': true };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    inputs: { counter: [1, 'counter'], name: [1, 'name'] },
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
          counter: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'counter', required: false }] },
          ],
          name: [{ type: i0.Input, args: [{ isSignal: true, alias: 'name', required: true }] }],
        },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'input_component_definition.ts',
      lineNumber: 6,
    });
})();

```