# /out/let_preceded_by_i18n.ngtypecheck.ts
```ts
/**
 * TCB for /let_preceded_by_i18n.ts
 * @generated
 */

import * as i0 from './let_preceded_by_i18n';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.value /*91,96*/ /*91,96*/;
    const _t1 /*114,120*/ =
      this.value /*123,128*/ /*123,128*/ * 2 /*131,132*/ /*123,132*/; /*109,133*/
    {
      '' + _t1 /*167,173*/;
    }
  }
}

```

# /out/let_preceded_by_i18n.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const result_r1: any = i0.ɵɵreadContextLet(2);
    i0.ɵɵtextInterpolate1('The result is ', result_r1);
  }
}

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
    decls: 4,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_4986895904639400025$$_LET_PRECEDED_BY_I18N_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Hello {$interpolation}',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{value}}' } },
          );
        i18n_0 = MSG_EXTERNAL_4986895904639400025$$_LET_PRECEDED_BY_I18N_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Hello ${'�0�'}:INTERPOLATION:`;
      }
      return [i18n_0];
    },
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdeclareLet(2);
        i0.ɵɵdomTemplate(3, MyApp_ng_template_3_Template, 1, 1, 'ng-template');
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.value);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance();
        i0.ɵɵstoreLet(ctx.value * 2);
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
        <div i18n>Hello {{value}}</div>
        @let result = value * 2;
        <ng-template>The result is {{result}}</ng-template>
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
      filePath: 'let_preceded_by_i18n.ts',
      lineNumber: 10,
    });
})();

```