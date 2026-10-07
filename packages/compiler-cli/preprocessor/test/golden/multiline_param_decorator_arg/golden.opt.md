# /out/test.ts
```ts
import { Injectable, Inject } from '@angular/core';
import * as angular from 'angular';
// @ts-ignore
import * as i0 from '@angular/core';

// A parameter decorator argument is spliced into `ɵsetClassMetadata` verbatim, newlines and all,
// so one that spans several source lines makes the `ctorParameters` callback span them too. Any
// suppression covering the callback as a whole reaches only its first line, which leaves every
// parameter after the splice unguarded. The guard therefore has to sit on each parameter.
export class MultiLineDecoratorArgService {
  constructor(
    private readonly $q: angular.IQService,
    private readonly $timeout: angular.ITimeoutService,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MultiLineDecoratorArgService, never> =
    function MultiLineDecoratorArgService_Factory(__ngFactoryType__: any): any {
      /* @ts-ignore */
      return new (__ngFactoryType__ || MultiLineDecoratorArgService)(
        i0.ɵɵinject({
          token: 'legacy.$q',
          legacy: true,
        }),
        i0.ɵɵinject(angular.ITimeoutService),
      );
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: MultiLineDecoratorArgService,
    factory: MultiLineDecoratorArgService.ɵfac,
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MultiLineDecoratorArgService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            type: undefined,
            decorators: [
              {
                type: Inject,
                args: [
                  {
                    token: 'legacy.$q',
                    legacy: true,
                  },
                ],
              },
            ],
          },
          {
            /* @ts-ignore */
            type: angular.ITimeoutService,
          },
        ],
        null,
      );
  }
}

```