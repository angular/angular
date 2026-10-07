# /out/attribute_interpolation.ngtypecheck.ts
```ts
/**
 * TCB for /attribute_interpolation.ts
 * @generated
 */

import * as i0 from './attribute_interpolation';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    '' + this.foo /*124,127*/ /*124,127*/ + this.foo /*132,135*/ /*132,135*/;
    '' + this.foo /*158,161*/ /*158,161*/;
    '' + this.foo /*193,196*/ /*193,196*/ + this.foo /*201,204*/ /*201,204*/;
    '' + this.foo /*239,242*/ /*239,242*/;
    '' + this.foo /*269,272*/ /*269,272*/;
  }
}

```

# /out/attribute_interpolation.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComponent {
  foo: any;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['my-comp']],
    decls: 5,
    vars: 8,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6301050568345677976$$_ATTRIBUTE_INTERPOLATION_TS_0 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, other {{START_TAG_SPAN}foo{CLOSE_TAG_SPAN}}}');
        i18n_0 = MSG_EXTERNAL_6301050568345677976$$_ATTRIBUTE_INTERPOLATION_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`{VAR_SELECT, select, other {{START_TAG_SPAN}foo{CLOSE_TAG_SPAN}}}`;
      }
      i18n_0 = i0.ɵɵi18nPostprocess(i18n_0, {
        'CLOSE_TAG_SPAN': '</span>',
        'START_TAG_SPAN': '<span title="�1�-�2�">',
        'VAR_SELECT': '�0�',
      });
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_369205108016154659$$_ATTRIBUTE_INTERPOLATION_TS_1 =
          /* @ts-ignore */
          goog.getMsg('{VAR_SELECT, select, other {{INTERPOLATION}-{INTERPOLATION}}}');
        i18n_1 = MSG_EXTERNAL_369205108016154659$$_ATTRIBUTE_INTERPOLATION_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize`{VAR_SELECT, select, other {{INTERPOLATION}-{INTERPOLATION}}}`;
      }
      i18n_1 = i0.ɵɵi18nPostprocess(i18n_1, { 'INTERPOLATION': '�4�', 'VAR_SELECT': '�3�' });
      let i18n_2;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_6009429127580785009$$_ATTRIBUTE_INTERPOLATION_TS_2 =
          /* @ts-ignore */
          goog.getMsg(
            '{$startTagSpan}{$closeTagSpan}{$startTagSpan_1}{$icu}{$closeTagSpan}{$startTagSpan_1}{$icu_1}{$closeTagSpan}',
            {
              'closeTagSpan': '[�/#2�|�/#3�|�/#4�]',
              'icu': i18n_0,
              'icu_1': i18n_1,
              'startTagSpan': '�#2�',
              'startTagSpan_1': '[�#3�|�#4�]',
            },
            {
              original_code: {
                'closeTagSpan': '</span>',
                'icu': '{foo, select, other {<span title="{{foo}}-{{foo}}">foo</span>}}',
                'icu_1': '{foo, select, other {{{foo}}-{{foo}}}}',
                'startTagSpan': '<span title="{{foo}}-{{foo}}">',
                'startTagSpan_1': '<span>',
              },
            },
          );
        i18n_2 = MSG_EXTERNAL_6009429127580785009$$_ATTRIBUTE_INTERPOLATION_TS_2;
      } else {
        /* @ts-ignore */
        i18n_2 = $localize`${'�#2�'}:START_TAG_SPAN:${'[�/#2�|�/#3�|�/#4�]'}:CLOSE_TAG_SPAN:${'[�#3�|�#4�]'}:START_TAG_SPAN_1:${i18n_0}:ICU@@6051755734147382484:${'[�/#2�|�/#3�|�/#4�]'}:CLOSE_TAG_SPAN:${'[�#3�|�#4�]'}:START_TAG_SPAN_1:${i18n_1}:ICU_1@@7593934392904803263:${'[�/#2�|�/#3�|�/#4�]'}:CLOSE_TAG_SPAN:`;
      }
      i18n_2 = i0.ɵɵi18nPostprocess(i18n_2);
      return [i18n_2, [3, 'title']];
    },
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵi18nStart(1, 0);
        i0.ɵɵdomElement(2, 'span', 1)(3, 'span')(4, 'span');
        i0.ɵɵi18nEnd();
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance(2);
        i0.ɵɵdomProperty('title', i0.ɵɵinterpolate2('', ctx.foo, '-', ctx.foo));
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.foo)(ctx.foo)(ctx.foo)(ctx.foo)(ctx.foo);
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
                selector: 'my-comp',
                template: `
      <div i18n>
        <span title="{{foo}}-{{foo}}"></span>
        <span>{foo, select, other {<span title="{{foo}}-{{foo}}">foo</span>}}</span>
        <span>{foo, select, other {{{foo}}-{{foo}}}}</span>
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
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'attribute_interpolation.ts',
      lineNumber: 13,
    });
})();

```