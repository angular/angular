# /out/input_directive_definition.ts
```ts
import { Directive, input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestDir {
  counter = input(
    0,
    ...((ngDevMode ? [{ debugName: 'counter' }] : /* istanbul ignore next */ []) as []),
  );
  name = input.required<string>(
    ...((ngDevMode ? [{ debugName: 'name' }] : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDir, never> = function TestDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestDir,
    never,
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
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: { counter: [1, 'counter'], name: [1, 'name'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'counter', required: false }] },
        ],
        name: [{ type: i0.Input, args: [{ isSignal: true, alias: 'name', required: true }] }],
      });
  }
}

```