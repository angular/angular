# /out/defer_multiple_hydrate_single_activator.ngtypecheck.ts
```ts
/**
 * TCB for /defer_multiple_hydrate_single_activator.ts
 * @generated
 */

import * as i0 from './defer_multiple_hydrate_single_activator';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/defer_multiple_hydrate_single_activator.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' One ');
  }
}
function MyApp_Defer_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Two ');
  }
}

export class MyApp {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 6,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0);
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(1, 0, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnIdle();
        i0.ɵɵdeferOnIdle();
        i0.ɵɵdomTemplate(3, MyApp_Defer_3_Template, 1, 0);
        i0.ɵɵdefer(4, 3, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnTimer(500);
        i0.ɵɵdeferOnIdle();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @defer (hydrate on idle) {
          One
        }
        @defer (hydrate on timer(500)) {
          Two
        }
      `,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'defer_multiple_hydrate_single_activator.ts',
      lineNumber: 13,
    });
})();

```