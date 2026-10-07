# /out/deferred_on_idle_with_timeout.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_on_idle_with_timeout.ts
 * @generated
 */

import * as i0 from './deferred_on_idle_with_timeout';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*103,110*/ /*103,110*/;
  }
}

```

# /out/deferred_on_idle_with_timeout.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.message, ' ');
  }
}
function MyApp_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdomElementStart(0, 'p');
    i0.ɵɵtext(1, 'Placeholder');
    i0.ɵɵdomElementEnd();
  }
}

export class MyApp {
  message = 'hello';
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
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 1)(
          1,
          MyApp_DeferPlaceholder_1_Template,
          2,
          0,
        );
        i0.ɵɵdefer(2, 0, null, null, 1);
        i0.ɵɵdeferOnIdle(500);
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
        @defer (on idle(500ms)) {
          {{message}}
        } @placeholder {
          <p>Placeholder</p>
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
      filePath: 'deferred_on_idle_with_timeout.ts',
      lineNumber: 12,
    });
})();

```