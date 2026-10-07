# /out/let_in_i18n.ngtypecheck.ts
```ts
/**
 * TCB for /let_in_i18n.ts
 * @generated
 */

import * as i0 from './let_in_i18n';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*95,101*/ =
      this.value /*104,109*/ /*104,109*/ * 2 /*112,113*/ /*104,113*/; /*90,114*/
    '' + _t1 /*131,137*/;
  }
}

```

# /out/let_in_i18n.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  value = 1;
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
    decls: 2,
    vars: 1,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5917233897031232074$$_LET_IN_I18N_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            ' The result is {$interpolation} ',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{result}}' } },
          );
        i18n_0 = MSG_EXTERNAL_5917233897031232074$$_LET_IN_I18N_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize` The result is ${'�0�'}:INTERPOLATION: `;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        const result_r1: any = ctx.value * 2;
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(result_r1);
        i0.ɵɵi18nApply(1);
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
        <div i18n>
          @let result = value * 2;
          The result is {{result}}
        </div>
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
      filePath: 'let_in_i18n.ts',
      lineNumber: 11,
    });
})();

```