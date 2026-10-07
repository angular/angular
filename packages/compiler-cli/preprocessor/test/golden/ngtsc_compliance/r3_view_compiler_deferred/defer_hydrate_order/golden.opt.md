# /out/defer_hydrate_order.ngtypecheck.ts
```ts
/**
 * TCB for /defer_hydrate_order.ts
 * @generated
 */

import * as i0 from './defer_hydrate_order';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    if (this.isReady /*86,93*/ /*86,93*/) {
    }
  }
}

```

# /out/defer_hydrate_order.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' Hello ');
  }
}
function MyApp_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, 'span');
    i0.ɵɵtext(1, 'Placeholder');
    i0.ɵɵdomElementEnd();
  }
}

export class MyApp {
  isReady = true;
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
    decls: 4,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0)(
          1,
          MyApp_DeferPlaceholder_1_Template,
          2,
          0,
        );
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(2, 0, null, null, 1, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnTimer(1337);
        i0.ɵɵdeferPrefetchOnViewport(0, -1);
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵdeferWhen(ctx.isReady);
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
        @defer (when isReady; hydrate on timer(1337); prefetch on viewport) {
          Hello
        } @placeholder {
          <span>Placeholder</span>
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
      filePath: 'defer_hydrate_order.ts',
      lineNumber: 12,
    });
})();

```