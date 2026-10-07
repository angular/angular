# /out/i18n_message_placeholder_entities.ngtypecheck.ts
```ts
/**
 * TCB for /i18n_message_placeholder_entities.ts
 * @generated
 */

import * as i0 from './i18n_message_placeholder_entities';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    '' + this.one /*124,127*/ /*124,127*/ + this.two /*154,157*/ /*154,157*/;
  }
}

```

# /out/i18n_message_placeholder_entities.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  one = 1;
  two = 2;
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
    decls: 2,
    vars: 2,
    consts: (): any => {
      let i18n_0;
      if (typeof ngI18nClosureMode !== 'undefined' && ngI18nClosureMode) {
        /**
         * @suppress {msgDescriptions}
         */
        const MSG_EXTERNAL_62163643690480935$$_I18N_MESSAGE_PLACEHOLDER_ENTITIES_TS_0 =
          /* @ts-ignore */
          goog.getMsg(
            'Interpolation: {$interpolation} Interpolation: {$interpolation_1}',
            { 'interpolation': '�0�', 'interpolation_1': '�1�' },
            { original_code: { 'interpolation': '{{ one }}', 'interpolation_1': '{{ two }}' } },
          );
        i18n_0 = MSG_EXTERNAL_62163643690480935$$_I18N_MESSAGE_PLACEHOLDER_ENTITIES_TS_0;
      } else {
        /* @ts-ignore */
        i18n_0 = $localize`Interpolation: ${'�0�'}:INTERPOLATION: Interpolation: ${'�1�'}:INTERPOLATION_1:`;
      }
      return [i18n_0];
    },
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵi18n(1, 0);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵi18nExp(ctx.one)(ctx.two);
        i0.ɵɵi18nApply(1);
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
                template: '<div i18n>Interpolation: {{ one }}&nbsp;Interpolation: {{ two }}</div>',
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
      filePath: 'i18n_message_placeholder_entities.ts',
      lineNumber: 8,
    });
})();

```