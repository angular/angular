# /out/complex_transform_functions.ts
```ts
import { Directive, input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

// Note: `@Input` non-signal inputs did not support arrow functions as an example.
const toBoolean = (v: string | boolean) => v === true || v !== '';

// Note: `@Input` non-signal inputs did not support transform function "builders" and generics.
const complexTransform =
  <T,>(defaultVal: T) =>
  (v: string) =>
    v || defaultVal;

export class TestDir {
  name = input.required<boolean, string | boolean>({
    ...(ngDevMode ? { debugName: 'name' } : /* istanbul ignore next */ {}),
    transform: (v) => v === true || v !== '',
  });
  name2 = input.required<boolean, string | boolean>({
    ...(ngDevMode ? { debugName: 'name2' } : /* istanbul ignore next */ {}),
    transform: toBoolean,
  });

  genericTransform = input.required({
    ...(ngDevMode ? { debugName: 'genericTransform' } : /* istanbul ignore next */ {}),
    transform: complexTransform(1),
  });
  genericTransform2 = input.required({
    ...(ngDevMode ? { debugName: 'genericTransform2' } : /* istanbul ignore next */ {}),
    transform: complexTransform(null),
  });
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
      'name': { 'alias': 'name'; 'required': true; 'isSignal': true };
      'name2': { 'alias': 'name2'; 'required': true; 'isSignal': true };
      'genericTransform': { 'alias': 'genericTransform'; 'required': true; 'isSignal': true };
      'genericTransform2': { 'alias': 'genericTransform2'; 'required': true; 'isSignal': true };
    },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    inputs: {
      name: [1, 'name'],
      name2: [1, 'name2'],
      genericTransform: [1, 'genericTransform'],
      genericTransform2: [1, 'genericTransform2'],
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        name: [{ type: i0.Input, args: [{ isSignal: true, alias: 'name', required: true }] }],
        name2: [{ type: i0.Input, args: [{ isSignal: true, alias: 'name2', required: true }] }],
        genericTransform: [
          { type: i0.Input, args: [{ isSignal: true, alias: 'genericTransform', required: true }] },
        ],
        genericTransform2: [
          {
            type: i0.Input,
            args: [{ isSignal: true, alias: 'genericTransform2', required: true }],
          },
        ],
      });
  }
}

```