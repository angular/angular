# /out/mixed_model_types.ts
```ts
import { Directive, EventEmitter, Input, model, Output } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestDir {
  counter = model(
    0,
    ...((ngDevMode ? [{ debugName: 'counter' }] : /* istanbul ignore next */ []) as []),
  );
  modelWithAlias = model(false, {
    ...(ngDevMode ? { debugName: 'modelWithAlias' } : /* istanbul ignore next */ {}),
    alias: 'alias',
  });

  decoratorInput = true;
  decoratorInputWithAlias = true;

  decoratorOutput = new EventEmitter<boolean>();
  decoratorOutputWithAlias = new EventEmitter<boolean>();

  decoratorInputTwoWay = true;
  decoratorInputTwoWayChange = new EventEmitter<boolean>();
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
      'modelWithAlias': { 'alias': 'alias'; 'required': false; 'isSignal': true };
      'decoratorInput': { 'alias': 'decoratorInput'; 'required': false };
      'decoratorInputWithAlias': { 'alias': 'publicNameDecorator'; 'required': false };
      'decoratorInputTwoWay': { 'alias': 'decoratorInputTwoWay'; 'required': false };
    },
    {
      'counter': 'counterChange';
      'modelWithAlias': 'aliasChange';
      'decoratorOutput': 'decoratorOutput';
      'decoratorOutputWithAlias': 'aliasDecoratorOutputWithAlias';
      'decoratorInputTwoWayChange': 'decoratorInputTwoWayChange';
    },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: {
      counter: [1, 'counter'],
      modelWithAlias: [1, 'alias', 'modelWithAlias'],
      decoratorInput: 'decoratorInput',
      decoratorInputWithAlias: [0, 'publicNameDecorator', 'decoratorInputWithAlias'],
      decoratorInputTwoWay: 'decoratorInputTwoWay',
    },
    outputs: {
      counter: 'counterChange',
      modelWithAlias: 'aliasChange',
      decoratorOutput: 'decoratorOutput',
      decoratorOutputWithAlias: 'aliasDecoratorOutputWithAlias',
      decoratorInputTwoWayChange: 'decoratorInputTwoWayChange',
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        decoratorInput: [{ type: Input }],
        decoratorInputWithAlias: [{ type: Input, args: ['publicNameDecorator'] }],
        decoratorOutput: [{ type: Output }],
        decoratorOutputWithAlias: [{ type: Output, args: ['aliasDecoratorOutputWithAlias'] }],
        decoratorInputTwoWay: [{ type: Input }],
        decoratorInputTwoWayChange: [{ type: Output }],
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'counter', required: false }] },
          { type: i0.Output, args: ['counterChange'] },
        ],
        modelWithAlias: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'alias', required: false }] },
          { type: i0.Output, args: ['aliasChange'] },
        ],
      });
  }
}

```