# /out/defer_with_hydrate_triggers.ngtypecheck.ts
```ts
/**
 * TCB for /defer_with_hydrate_triggers.ts
 * @generated
 */

import * as i0 from './defer_with_hydrate_triggers';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*71,78*/ /*71,78*/;
    if (
      this
        .isVisible /*117,126*/
        () /*117,128*/ ||
      this.isReady /*132,139*/ /*132,139*/ /*117,139*/
    ) {
    }
    '' + this.message /*273,280*/ /*273,280*/;
  }
}

```

# /out/defer_with_hydrate_triggers.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.message, ' ');
  }
}

export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
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
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomTemplate(1, MyApp_Defer_1_Template, 1, 1);
        i0.ɵɵenableIncrementalHydrationRuntime();
        i0.ɵɵdefer(2, 1, null, null, null, null, null, null, null, 1);
        i0.ɵɵdeferHydrateOnIdle();
        i0.ɵɵdeferHydrateOnImmediate();
        i0.ɵɵdeferHydrateOnTimer(1337);
        i0.ɵɵdeferHydrateOnHover();
        i0.ɵɵdeferHydrateOnInteraction();
        i0.ɵɵdeferHydrateOnViewport();
        i0.ɵɵdeferOnIdle();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵdeferHydrateWhen(ctx.isVisible() || ctx.isReady);
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
        {{message}}
        @defer (
          hydrate when isVisible() || isReady;
          hydrate on idle, timer(1337);
          hydrate on immediate, hover;
          hydrate on interaction;
          hydrate on viewport) {
          {{message}}
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
      filePath: 'defer_with_hydrate_triggers.ts',
      lineNumber: 16,
    });
})();

```