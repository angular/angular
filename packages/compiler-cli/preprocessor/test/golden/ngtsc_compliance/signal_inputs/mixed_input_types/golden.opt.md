# /out/mixed_input_types.ts
```ts
import { Directive, Input, input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function convertToBoolean(value: string | boolean) {
  return value === true || value !== '';
}

export class TestDir {
  counter = input(
    0,
    ...((ngDevMode ? [{ debugName: 'counter' }] : /* istanbul ignore next */ []) as []),
  );
  signalWithTransform = input(false, {
    ...(ngDevMode ? { debugName: 'signalWithTransform' } : /* istanbul ignore next */ {}),
    transform: convertToBoolean,
  });
  signalWithTransformAndAlias = input(false, {
    ...(ngDevMode ? { debugName: 'signalWithTransformAndAlias' } : /* istanbul ignore next */ {}),
    alias: 'publicNameSignal',
    transform: convertToBoolean,
  });

  decoratorInput = true;
  decoratorInputWithAlias = true;
  decoratorInputWithTransformAndAlias = true;
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
      'signalWithTransform': {
        'alias': 'signalWithTransform';
        'required': false;
        'isSignal': true;
      };
      'signalWithTransformAndAlias': {
        'alias': 'publicNameSignal';
        'required': false;
        'isSignal': true;
      };
      'decoratorInput': { 'alias': 'decoratorInput'; 'required': false };
      'decoratorInputWithAlias': { 'alias': 'publicNameDecorator'; 'required': false };
      'decoratorInputWithTransformAndAlias': { 'alias': 'publicNameDecorator2'; 'required': false };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: {
      counter: [1, 'counter'],
      signalWithTransform: [1, 'signalWithTransform'],
      signalWithTransformAndAlias: [1, 'publicNameSignal', 'signalWithTransformAndAlias'],
      decoratorInput: 'decoratorInput',
      decoratorInputWithAlias: [0, 'publicNameDecorator', 'decoratorInputWithAlias'],
      decoratorInputWithTransformAndAlias: [
        2,
        'publicNameDecorator2',
        'decoratorInputWithTransformAndAlias',
        convertToBoolean,
      ],
    },
  });
  // @ts-ignore
  declare static ngAcceptInputType_decoratorInputWithTransformAndAlias: Parameters<
    typeof convertToBoolean
  >[0];
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        decoratorInput: [{ type: Input }],
        decoratorInputWithAlias: [{ type: Input, args: ['publicNameDecorator'] }],
        decoratorInputWithTransformAndAlias: [
          { type: Input, args: [{ alias: 'publicNameDecorator2', transform: convertToBoolean }] },
        ],
        counter: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'counter', required: false }] },
        ],
        signalWithTransform: [
          {
            type: i0.Input,
            args: [{ isSignal: true, alias: 'signalWithTransform', required: false }],
          },
        ],
        signalWithTransformAndAlias: [
          {
            type: i0.Input,
            args: [{ isSignal: true, alias: 'publicNameSignal', required: false }],
          },
        ],
      });
  }
}

```