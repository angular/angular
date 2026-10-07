# /out/shared_placeholder.ngtypecheck.ts
```ts
/**
 * TCB for /shared_placeholder.ts
 * @generated
 */

import * as i0 from './shared_placeholder';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.gender /*129,135*/ /*129,135*/;
    '' + this.gender /*205,211*/ /*205,211*/;
    {
      '' + this.gender /*308,314*/ /*308,314*/;
    }
  }
}

```

# /out/shared_placeholder.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_div_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'div');
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.gender);
    i0.ɵɵi18nApply(0);
  }
}

export class MyComponent {
  gender = 'male';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-component',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-component']],
    standalone: false,
    decls: 4,
    vars: 3,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$_SHARED_PLACEHOLDER_TS_0 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, male {male} female {female} other {other}}');
        i18n_0 = MSG_EXTERNAL_7842238767399919809$$_SHARED_PLACEHOLDER_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, { 'VAR_SELECT': '�0�' });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$_SHARED_PLACEHOLDER_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, male {male} female {female} other {other}}');
        i18n_1 = MSG_EXTERNAL_7842238767399919809$$_SHARED_PLACEHOLDER_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'VAR_SELECT': '�1�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7842238767399919809$$_SHARED_PLACEHOLDER_TS_2 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, male {male} female {female} other {other}}');
        i18n_2 = MSG_EXTERNAL_7842238767399919809$$_SHARED_PLACEHOLDER_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`{VAR_SELECT, select, male {male} female {female} other {other}}`;
      }
      i18n_2 = i0.ɵɵi18nPostprocess(i18n_2, { 'VAR_SELECT': '�0:1�' });
      let i18n_3;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_795316458693634260$$_SHARED_PLACEHOLDER_TS_3 =
          /* @ts-ignore */
          goog.getMsg(
            ' {$icu} {$startTagDiv} {$icu} {$closeTagDiv}{$startTagDiv_1} {$icu} {$closeTagDiv}',
            {
              'closeTagDiv': '[�/#2�|�/#1:1��/*3:1�]',
              'icu': '�I18N_EXP_ICU�',
              'startTagDiv': '�#2�',
              'startTagDiv_1': '�*3:1��#1:1�',
            },
            {
              original_code: {
                'closeTagDiv': '</div>',
                'icu': '{gender, select, male {male} female {female} other {other}}',
                'startTagDiv': '<div>',
                'startTagDiv_1': '<div *ngIf="visible">',
              },
            },
          );
        i18n_3 = MSG_EXTERNAL_795316458693634260$$_SHARED_PLACEHOLDER_TS_3;
      } else {
        /* @ts-ignore */
        i18n_3 = $localize` ${'�I18N_EXP_ICU�'}:ICU@@7670372064920373295: ${'�#2�'}:START_TAG_DIV: ${'�I18N_EXP_ICU�'}:ICU@@7670372064920373295: ${'[�/#2�|�/#1:1��/*3:1�]'}:CLOSE_TAG_DIV:${'�*3:1��#1:1�'}:START_TAG_DIV_1: ${'�I18N_EXP_ICU�'}:ICU@@7670372064920373295: ${'[�/#2�|�/#1:1��/*3:1�]'}:CLOSE_TAG_DIV:`;
      }
      i18n_3 = i0.ɵɵi18nPostprocess(i18n_3, { 'ICU': [i18n_0, i18n_1, i18n_2] });
      return [i18n_3, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵelement(2, 'div');
        i0.ɵɵtemplate(3, MyComponent_div_3_Template, 2, 1, 'div', 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(3);
        i0.ɵɵproperty('ngIf', ctx.visible);
        i0.ɵɵi18nExp(ctx.gender)(ctx.gender);
        i0.ɵɵi18nApply(1);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-component',
                template: `
      <div i18n>
        {gender, select, male {male} female {female} other {other}}
        <div>
          {gender, select, male {male} female {female} other {other}}
        </div>
        <div *ngIf="visible">
          {gender, select, male {male} female {female} other {other}}
        </div>
      </div>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'shared_placeholder.ts',
      lineNumber: 18,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComponent], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComponent] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComponent] });
})();

```