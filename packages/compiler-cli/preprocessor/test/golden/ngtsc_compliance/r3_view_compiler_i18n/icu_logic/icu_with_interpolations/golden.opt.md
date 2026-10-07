# /out/icu_with_interpolations.ngtypecheck.ts
```ts
/**
 * TCB for /icu_with_interpolations.ts
 * @generated
 */

import * as i0 from './icu_with_interpolations';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.gender /*129,135*/ /*129,135*/;
    '' + this.weight /*159,165*/ /*159,165*/;
    '' + this.height /*188,194*/ /*188,194*/;
    {
      '' + this.age /*251,254*/ /*251,254*/;
      '' + this.otherAge /*314,322*/ /*314,322*/;
    }
  }
}

```

# /out/icu_with_interpolations.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyComponent_span_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, 'span');
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵi18nExp(ctx_r0.age)(ctx_r0.otherAge);
    i0.ɵɵi18nApply(0);
  }
}

export class MyComponent {
  gender = 'male';
  weight = 1;
  height = 1;
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
    decls: 3,
    vars: 4,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7825031864601787094$$_ICU_WITH_INTERPOLATIONS_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}',
          );
        i18n_0 = MSG_EXTERNAL_7825031864601787094$$_ICU_WITH_INTERPOLATIONS_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, male {male {INTERPOLATION}} female {female {INTERPOLATION_1}} other {other}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        'INTERPOLATION': '�1�',
        'INTERPOLATION_1': '�2�',
        'VAR_SELECT': '�0�',
      });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_2310343208266678305$$_ICU_WITH_INTERPOLATIONS_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            '{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}',
          );
        i18n_1 = MSG_EXTERNAL_2310343208266678305$$_ICU_WITH_INTERPOLATIONS_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {INTERPOLATION}}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'INTERPOLATION': '�1:1�', 'VAR_SELECT': '�0:1�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_7229970708438032491$$_ICU_WITH_INTERPOLATIONS_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            ' {$icu} {$startTagSpan} {$icu_1} {$closeTagSpan}',
            {
              'closeTagSpan': '�/#1:1��/*2:1�',
              'icu': i18n_0,
              'icu_1': i18n_1,
              'startTagSpan': '�*2:1��#1:1�',
            },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'icu':
                  '{gender, select, male {male {{ weight }}} female {female {{ height }}} other {other}}',
                'icu_1':
                  '{age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {{ otherAge }}}}',
                'startTagSpan': '<span *ngIf="ageVisible">',
              },
            },
          );
        i18n_2 = MSG_EXTERNAL_7229970708438032491$$_ICU_WITH_INTERPOLATIONS_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize` ${i18n_0}:ICU@@567200399523107034: ${'�*2:1��#1:1�'}:START_TAG_SPAN: ${i18n_1}:ICU_1@@5762277079421427850: ${'�/#1:1��/*2:1�'}:CLOSE_TAG_SPAN:`;
      }
      return [i18n_2, [4, 'ngIf']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵtemplate(2, MyComponent_span_2_Template, 2, 2, 'span', 1);
        i0.ɵɵi18nEnd();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('ngIf', ctx.ageVisible);
        i0.ɵɵi18nExp(ctx.gender)(ctx.weight)(ctx.height);
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
        {gender, select, male {male {{ weight }}} female {female {{ height }}} other {other}}
        <span *ngIf="ageVisible">
          {age, select, 10 {ten} 20 {twenty} 30 {thirty} other {other: {{ otherAge }}}}
        </span>
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
      filePath: 'icu_with_interpolations.ts',
      lineNumber: 15,
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