# /out/i18n_message_interpolation_whitespace.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_message_interpolation_whitespace.ts
 * @generated
 */

import * as i0 from './i18n_message_interpolation_whitespace';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    '' + this.titleValue /*127,137*/ /*127,137*/;
    '' + this.bodyValue /*176,185*/ /*176,185*/;
  }
}

```

# /out/i18n_message_interpolation_whitespace.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  titleValue: string = '';
  bodyValue: string = '';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'test-cmp',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['test-cmp']],
    standalone: false,
    decls: 3,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_5931834392893391168$$_I18N_MESSAGE_INTERPOLATION_WHITESPACE_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            '  pre-title {$interpolation}  post-title',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{titleValue}}' } },
          );
        i18n_0 = MSG_EXTERNAL_5931834392893391168$$_I18N_MESSAGE_INTERPOLATION_WHITESPACE_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`  pre-title ${'�0�'}:INTERPOLATION:  post-title`;
      }
      let i18n_1;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_348594345054242680$$_I18N_MESSAGE_INTERPOLATION_WHITESPACE_TS_1 =
          /* @ts-ignore */
          goog.getMsg(
            ' pre-body {$interpolation} post-body',
            { 'interpolation': '�0�' },
            { original_code: { 'interpolation': '{{bodyValue}}' } },
          );
        i18n_1 = MSG_EXTERNAL_348594345054242680$$_I18N_MESSAGE_INTERPOLATION_WHITESPACE_TS_1;
      } else {
        /* @ts-ignore */
        i18n_1 = $localize` pre-body ${'�0�'}:INTERPOLATION: post-body`;
      }
      return [i18n_1, ['title', i18n_0], [6, 'title']];
    },
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div', 2);
        i0.ɵɵi18nAttributes(1, 1);
        i0.ɵɵi18n(2, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵi18nExp(ctx.titleValue);
        i0.ɵɵi18nApply(1);
        i0.ɵɵadvance(2);
        i0.ɵɵi18nExp(ctx.bodyValue);
        i0.ɵɵi18nApply(2);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'test-cmp',
                template:
                  '<div i18n title="  pre-title {{titleValue}}  post-title" i18n-title>  pre-body {{bodyValue}}  post-body</div>',
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'i18n_message_interpolation_whitespace.ts',
      lineNumber: 8,
    });
})();

```