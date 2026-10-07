# /out/output_in_directive.ts
```ts
import { Directive, EventEmitter, output } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestDir {
  a = output();
  b = output<string>({});
  c = output<void>({ alias: 'cPublic' });
  d = outputFromObservable(new EventEmitter<string>());
  e = outputFromObservable(new EventEmitter<number>());
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
    {},
    { 'a': 'a'; 'b': 'b'; 'c': 'cPublic'; 'd': 'd'; 'e': 'e' },
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: TestDir,
    outputs: { a: 'a', b: 'b', c: 'cPublic', d: 'd', e: 'e' },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(TestDir, [{ type: Directive, args: [{}] }], null, {
        a: [{ type: i0.Output, args: ['a'] }],
        b: [{ type: i0.Output, args: ['b'] }],
        c: [{ type: i0.Output, args: ['cPublic'] }],
        d: [{ type: i0.Output, args: ['d'] }],
        e: [{ type: i0.Output, args: ['e'] }],
      });
  }
}

```