# /out/transform_not_captured.ts
```ts
import { Directive, input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function convertToBoolean(value: string | boolean) {
  return value === true || value !== '';
}

export class TestDir {
  name = input.required<boolean, string | boolean>({
    ...(ngDevMode ? { debugName: 'name' } : /* istanbul ignore next */ {}),
    transform: convertToBoolean,
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
    { 'name': { 'alias': 'name'; 'required': true; 'isSignal': true } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: TestDir, inputs: { name: [1, 'name'] } });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        name: [{ type: i0.Input, args: [{ isSignal: true, alias: 'name', required: true }] }],
      });
  }
}

```