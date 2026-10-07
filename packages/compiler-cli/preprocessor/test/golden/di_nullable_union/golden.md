# /out/app.ts
```ts
import { Directive, Injectable, Optional } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Logger {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Logger, never> = function Logger_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Logger)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Logger,
    factory: Logger.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Logger,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        null,
        null,
      );
  }
}

export class TestDirective {
  constructor(public logger: Logger | null) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestDirective, [{ optional: true }]> =
    function TestDirective_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || TestDirective)(i0.ɵɵdirectiveInject(Logger, 8));
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    TestDirective,
    '[test]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: TestDirective, selectors: [['', 'test', '']] });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[test]',
                standalone: true,
              },
            ],
          },
        ],
        (): any => [{ type: Logger, decorators: [{ type: Optional }] }],
        null,
      );
  }
}

```