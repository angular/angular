# /out/model_directive_definition.ts
```ts
import { Directive, model } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestDir {
  counter = model(
    0,
    ...((ngDevMode ? [{ debugName: 'counter' }] : /* istanbul ignore next */ []) as []),
  );
  name = model.required<string>(
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
    { 'counter': 'counterChange'; 'name': 'nameChange' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: { counter: [1, 'counter'], name: [1, 'name'] },
    outputs: { counter: 'counterChange', name: 'nameChange' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'counter', required: false }] },
          { type: i0.Output, args: ['counterChange'] },
        ],
        name: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'name', required: true }] },
          { type: i0.Output, args: ['nameChange'] },
        ],
      });
  }
}

```