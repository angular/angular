# /out/property_decorators.ts
```ts
import { Directive, Input, Output } from '@angular/core';
import { CustomPropDecorator } from './custom';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyDir {
  foo!: string;

  bar!: string;

  @CustomPropDecorator() custom!: string;

  @CustomPropDecorator() mixed!: string;

  none!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyDir, never> = function MyDir_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyDir)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyDir,
    never,
    never,
    {
      'foo': { 'alias': 'foo'; 'required': false };
      'bar': { 'alias': 'baz'; 'required': false };
      'mixed': { 'alias': 'mixed'; 'required': false };
    },
    { 'mixed': 'mixed' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyDir,
    inputs: { foo: 'foo', bar: [0, 'baz', 'bar'], mixed: 'mixed' },
    outputs: { mixed: 'mixed' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(MyDir, [{ type: Directive }], null, {
        foo: [{ type: Input }],
        bar: [{ type: Input, args: ['baz'] }],
        custom: [],
        mixed: [{ type: Input }, { type: Output }],
      });
  }
}

```