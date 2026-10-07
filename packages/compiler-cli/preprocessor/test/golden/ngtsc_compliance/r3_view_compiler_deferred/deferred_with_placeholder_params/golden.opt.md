# /out/deferred_with_placeholder_params.ngtypecheck.ts
```ts
/**
 * TCB for /deferred_with_placeholder_params.ts
 * @generated
 */

import * as i0 from './deferred_with_placeholder_params';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
}

```

# /out/deferred_with_placeholder_params.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Defer_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'button');
  }
}
function MyApp_DeferPlaceholder_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelement(0, 'img', 1);
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 4,
    vars: 0,
    consts: [[2000], ['src', 'placeholder.gif']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomTemplate(0, MyApp_Defer_0_Template, 1, 0)(
          1,
          MyApp_DeferPlaceholder_1_Template,
          1,
          0,
        );
        i0.ɵɵdefer(2, 0, null, null, 1, null, null, 0, i0.ɵɵdeferEnableTimerScheduling);
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
        @defer {
          <button></button>
        } @placeholder (minimum 2s) {
          <img src="placeholder.gif">
        }
      `,
                standalone: false,
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
      filePath: 'deferred_with_placeholder_params.ts',
      lineNumber: 13,
    });
})();

```